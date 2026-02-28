import { analyze } from "./index";
import { gigWorkerProfile, creatorProfile, freelancerProfile } from "../samples/index";

function printResult(label: string, input: typeof gigWorkerProfile) {
  console.log("\n" + "=".repeat(60));
  console.log(`PROFILE: ${label}`);
  console.log("=".repeat(60));

  try {
    const result = analyze(input);

    console.log("\n📊 FEATURES:");
    console.log(`  Avg Income:       $${Math.round(result.features.avgIncome).toLocaleString()}`);
    console.log(`  Std Deviation:    $${Math.round(result.features.stdIncome).toLocaleString()}`);
    console.log(`  CV (volatility):  ${result.features.cv.toFixed(3)}`);
    console.log(`  Volatility Score: ${result.features.volatilityScore}/100`);
    console.log(`  Runway Days:      ${Math.round(result.features.runwayDays)}`);
    console.log(`  Negative Mo Rate: ${Math.round(result.features.negativeMonthRate * 100)}%`);

    console.log("\n🎲 SIMULATION:");
    console.log(`  Shortfall Prob:   ${Math.round(result.outcomes.pShortfall * 100)}%`);
    console.log(`  Median End Buffer: $${Math.round(result.outcomes.endBufferMedian).toLocaleString()}`);
    console.log(`  Median Trajectory: ${result.outcomes.medianTrajectory.map(v => "$" + Math.round(v).toLocaleString()).join(" → ")}`);
    console.log(`  P10 Trajectory:    ${result.outcomes.p10Trajectory.map(v => "$" + Math.round(v).toLocaleString()).join(" → ")}`);
    console.log(`  P90 Trajectory:    ${result.outcomes.p90Trajectory.map(v => "$" + Math.round(v).toLocaleString()).join(" → ")}`);

    console.log("\n💡 RECOMMENDATION:");
    console.log(`  Buffer Target:    ${result.recommendation.bufferTargetMonths} months`);
    console.log(`  Target ($):       $${Math.round(result.recommendation.targetBuffer).toLocaleString()}`);
    console.log(`  Gap to Fill:      $${Math.round(result.recommendation.gap).toLocaleString()}`);
    console.log(`  Route Pct:        ${Math.round(result.recommendation.routePct * 100)}%`);
    console.log(`  Rule: ${result.recommendation.routingRuleText}`);

    console.log("\n📝 EXPLANATION:");
    result.explanation.forEach((line, i) => console.log(`  ${i + 1}. ${line}`));

    // Sanity checks
    console.log("\n✅ SANITY CHECKS:");
    console.log(`  pShortfall in [0,1]:     ${result.outcomes.pShortfall >= 0 && result.outcomes.pShortfall <= 1 ? "PASS" : "FAIL"}`);
    console.log(`  volatilityScore in [0,100]: ${result.features.volatilityScore >= 0 && result.features.volatilityScore <= 100 ? "PASS" : "FAIL"}`);
    console.log(`  trajectory length = horizon+1: ${result.outcomes.medianTrajectory.length === input.horizonMonths + 1 ? "PASS" : "FAIL"}`);
    console.log(`  targetBuffer > 0:        ${result.recommendation.targetBuffer > 0 ? "PASS" : "FAIL"}`);

  } catch (err) {
    console.log(`  ❌ ERROR: ${err}`);
  }
}

// Run all three profiles
printResult("Gig Worker", gigWorkerProfile);
printResult("Creator", creatorProfile);
printResult("Freelancer", freelancerProfile);

// Test: smoothing should reduce shortfall probability
console.log("\n" + "=".repeat(60));
console.log("TEST: Smoothing reduces shortfall probability");
console.log("=".repeat(60));

const withoutSmoothing = analyze({ ...creatorProfile, applySmoothing: false });
const withSmoothing = analyze({ ...creatorProfile, applySmoothing: true });

console.log(`  Without smoothing: ${Math.round(withoutSmoothing.outcomes.pShortfall * 100)}% shortfall`);
console.log(`  With smoothing:    ${Math.round(withSmoothing.outcomes.pShortfall * 100)}% shortfall`);
console.log(`  Smoothing helped:  ${withSmoothing.outcomes.pShortfall <= withoutSmoothing.outcomes.pShortfall ? "✅ PASS" : "⚠️  FAIL (random variance — run again)"}`);

// Test: edge case — empty incomes
console.log("\n" + "=".repeat(60));
console.log("TEST: Edge case — empty incomes");
console.log("=".repeat(60));
try {
  analyze({ ...gigWorkerProfile, incomes: [] });
  console.log("  ❌ FAIL: Should have thrown error");
} catch (e) {
  console.log(`  ✅ PASS: Correctly threw error: "${e}"`);
}