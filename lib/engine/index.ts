import { ProfileInput, Features, SimOutcomes, Recommendation, AnalysisOutput } from "@/types";

// ─── Helpers ────────────────────────────────────────────────
function clamp(min: number, max: number, val: number) {
  return Math.min(max, Math.max(min, val));
}

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[], avg?: number) {
  const m = avg ?? mean(arr);
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}

function percentile(sorted: number[], p: number) {
  const idx = Math.floor((p / 100) * sorted.length);
  return sorted[clamp(0, sorted.length - 1, idx)];
}

// ─── Normalize: group by YYYY-MM, fill gaps with 0 ──────────
function toMonthlyIncome(incomes: { date: string; amount: number }[]): number[] {
  const map: Record<string, number> = {};
  for (const { date, amount } of incomes) {
    const key = date.slice(0, 7); // "YYYY-MM"
    map[key] = (map[key] ?? 0) + amount;
  }
  const keys = Object.keys(map).sort();
  if (keys.length === 0) return [];

  // Fill months between first and last
  const result: number[] = [];
  const start = new Date(keys[0] + "-01");
  const end = new Date(keys[keys.length - 1] + "-01");
  const cur = new Date(start);
  while (cur <= end) {
    const k = cur.toISOString().slice(0, 7);
    result.push(map[k] ?? 0);
    cur.setMonth(cur.getMonth() + 1);
  }
  return result;
}

// ─── Features ───────────────────────────────────────────────
function computeFeatures(monthly: number[], expenses: number, buffer: number): Features {
  const avg = mean(monthly);
  const s = std(monthly, avg);
  const cv = avg > 0 ? s / avg : 0;
  const negativeMonthRate = monthly.filter((m) => m < expenses).length / monthly.length;
  const runwayDays = expenses > 0 ? (buffer / expenses) * 30 : 999;
  //const volatilityScore = clamp(0, 100, Math.round(100 * cv / 2));
  const volatilityScore = clamp(0, 100, Math.round(
    cv * 40 +                          // 40% weight: income variability
    (negativeMonthRate * 35) +          // 35% weight: how often you can't cover expenses
    (runwayDays < 30 ? 25 : runwayDays < 60 ? 12 : 0)  // 25% weight: runway urgency
  ));

  return {
    avgIncome: avg,
    stdIncome: s,
    cv,
    minIncome: Math.min(...monthly),
    maxIncome: Math.max(...monthly),
    negativeMonthRate,
    runwayDays,
    volatilityScore,
  };
}

// ─── Monte Carlo Simulation (bootstrap) ─────────────────────
function simulate(
  monthly: number[],
  expenses: number,
  startBuffer: number,
  n: number,
  horizon: number,
  applySmoothing: boolean,
  routePct: number,
  avgIncome: number
): SimOutcomes {
  const trajectories: number[][] = [];
  let shortfallCount = 0;

  for (let i = 0; i < n; i++) {
    let buffer = startBuffer;
    const path: number[] = [buffer];
    let hitShortfall = false;

    for (let m = 0; m < horizon; m++) {
      // Bootstrap: random sample from history
      let income = monthly[Math.floor(Math.random() * monthly.length)];

      // Apply smoothing: divert excess on high months into buffer
      if (applySmoothing && income > avgIncome) {
        const excess = income - avgIncome;
        buffer += excess * routePct;
        income -= excess * routePct;
      }

      buffer += income - expenses;
      path.push(buffer);
      if (buffer < 0) hitShortfall = true;
    }

    trajectories.push(path);
    if (hitShortfall) shortfallCount++;
  }

  // Compute percentile trajectories at each month
  const medianTraj: number[] = [];
  const p10Traj: number[] = [];
  const p90Traj: number[] = [];

  for (let m = 0; m <= horizon; m++) {
    const vals = trajectories.map((t) => t[m]).sort((a, b) => a - b);
    medianTraj.push(percentile(vals, 50));
    p10Traj.push(percentile(vals, 10));
    p90Traj.push(percentile(vals, 90));
  }

  return {
    pShortfall: shortfallCount / n,
    medianTrajectory: medianTraj,
    p10Trajectory: p10Traj,
    p90Trajectory: p90Traj,
    endBufferMedian: medianTraj[horizon],
  };
}

// ─── Recommendation ─────────────────────────────────────────
function recommend(features: Features, expenses: number, buffer: number): Recommendation {
  const bufferTargetMonths = clamp(1, 6, 1 + 4 * features.cv);
  const targetBuffer = bufferTargetMonths * expenses;
  const gap = Math.max(0, targetBuffer - buffer);
  const routePct = clamp(0.1, 0.6, features.avgIncome > 0 ? gap / (features.avgIncome * 3) : 0.3);
  const thresholdIncome = Math.round(features.avgIncome);
  const routePctDisplay = Math.round(routePct * 100);

  return {
    bufferTargetMonths: Math.round(bufferTargetMonths * 10) / 10,
    targetBuffer,
    gap,
    routePct,
    routingRuleText: `Route ${routePctDisplay}% of any income above $${thresholdIncome.toLocaleString()} into your buffer until it reaches $${Math.round(targetBuffer).toLocaleString()}`,
  };
}

// ─── Explanation Bullets ─────────────────────────────────────
function explain(features: Features, outcomes: SimOutcomes, rec: Recommendation): string[] {
  return [
    `Your income varies ${features.cv.toFixed(2)}× month-to-month (${features.cv > 0.5 ? "high" : features.cv > 0.25 ? "moderate" : "low"} volatility).`,
    `You have ${Math.round(features.runwayDays)} days of runway at your current expense level.`,
    `In ${Math.round(outcomes.pShortfall * 100)}% of simulations, your buffer dropped below $0 in the next ${outcomes.medianTrajectory.length - 1} months.`,
    `${Math.round(features.negativeMonthRate * 100)}% of your past months had income below expenses.`,
    `We recommend building a buffer of ${rec.bufferTargetMonths} months of expenses ($${Math.round(rec.targetBuffer).toLocaleString()}).`,
    rec.routingRuleText + ".",
  ];
}

// ─── Main Entry Point ─────────────────────────────────────────
export function analyze(input: ProfileInput): AnalysisOutput {
  const monthly = toMonthlyIncome(input.incomes);
  if (monthly.length === 0) throw new Error("No valid income data provided.");

  const features = computeFeatures(monthly, input.monthlyExpenses, input.currentBuffer);
  const rec = recommend(features, input.monthlyExpenses, input.currentBuffer);

  const outcomes = simulate(
    monthly,
    input.monthlyExpenses,
    input.currentBuffer,
    input.simulations,
    input.horizonMonths,
    input.applySmoothing ?? false,
    rec.routePct,
    features.avgIncome
  );

  const explanation = explain(features, outcomes, rec);

  return { features, outcomes, recommendation: rec, explanation };
}