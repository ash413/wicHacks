"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { gigWorkerProfile, creatorProfile, freelancerProfile } from "@/lib/samples";
import { ProfileInput, AnalysisOutput } from "@/types";

function KPICard({
  label, value, sub, color, badge
}: { label: string; value: string; sub: string; color: string; badge?: string }) {
  return (
    <div className={`rounded-2xl border ${color} bg-gray-900 p-5 flex flex-col gap-1`}>
      <span className="text-xs uppercase tracking-widest text-gray-400">{label}</span>
      <span className="text-3xl font-bold text-white">{value}</span>
      {badge && <span className="text-xs text-green-400 font-semibold">{badge}</span>}
      <span className="text-xs text-gray-500">{sub}</span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#ef4444" : score >= 40 ? "#f59e0b" : "#22c55e";
  const label = score >= 70 ? "HIGH RISK" : score >= 40 ? "MODERATE" : "STABLE";
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="#1f2937" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="50" fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${(score / 100) * 314} 314`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
        <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="9">/100</text>
      </svg>
      <span className="text-xs font-semibold tracking-widest" style={{ color }}>{label}</span>
    </div>
  );
}

export default function Home() {
  const emptyIncomes = [
    { date: "2024-01", amount: 0 },
    { date: "2024-02", amount: 0 },
    { date: "2024-03", amount: 0 },
  ];

  const [incomes, setIncomes] = useState(emptyIncomes);
  const [expenses, setExpenses] = useState(3000);
  const [buffer, setBuffer] = useState(2000);
  const [smoothing, setSmoothing] = useState(false);
  const [result, setResult] = useState<AnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [baselineShortfall, setBaselineShortfall] = useState<number | null>(null);

  function loadProfile(profile: ProfileInput) {
    setIncomes([...profile.incomes]);
    setExpenses(profile.monthlyExpenses);
    setBuffer(profile.currentBuffer);
    setResult(null);
    setError("");
    setSmoothing(false);
    setBaselineShortfall(null);
  }

  function updateIncome(i: number, field: "date" | "amount", val: string) {
    const updated = [...incomes];
    updated[i] = { ...updated[i], [field]: field === "amount" ? Number(val) : val };
    setIncomes(updated);
  }

  function addRow() {
    setIncomes([...incomes, { date: "2024-01", amount: 0 }]);
  }

  function removeRow(i: number) {
    setIncomes(incomes.filter((_, idx) => idx !== i));
  }

  async function runAnalysis(useSmoothing: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incomes,
          monthlyExpenses: expenses,
          currentBuffer: buffer,
          horizonMonths: 3,
          simulations: 1000,
          applySmoothing: useSmoothing,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      // Save baseline (no smoothing) shortfall for comparison
      if (!useSmoothing) {
        setBaselineShortfall(Math.round(data.outcomes.pShortfall * 100));
      }
      setResult(data);
    } catch {
      setError("Failed to connect to analysis engine.");
    } finally {
      setLoading(false);
    }
  }

  const chartData = result
    ? result.outcomes.medianTrajectory.map((v, i) => ({
        month: i === 0 ? "Now" : `Month ${i}`,
        Median: Math.round(v),
        "Worst 10%": Math.round(result.outcomes.p10Trajectory[i]),
        "Best 90%": Math.round(result.outcomes.p90Trajectory[i]),
      }))
    : [];

  const shortfallPct = result ? Math.round(result.outcomes.pShortfall * 100) : 0;
  const shortfallDrop = smoothing && baselineShortfall !== null && shortfallPct < baselineShortfall
    ? baselineShortfall - shortfallPct
    : null;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Income Firewall 🔥</h1>
          <p className="text-sm text-gray-400 mt-0.5">Cash Flow Volatility Risk Engine</p>
        </div>
        <span className="text-xs text-gray-600 border border-gray-800 rounded-full px-3 py-1">Prototype · Not Financial Advice</span>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── LEFT: Inputs ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Profile</h2>
            <div className="flex flex-col gap-2">
              <span className="text-xs text-gray-500">Load sample profile:</span>
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: "🚗 Gig Worker", profile: gigWorkerProfile },
                  { label: "🎨 Creator", profile: creatorProfile },
                  { label: "💻 Freelancer", profile: freelancerProfile },
                ].map(({ label, profile }) => (
                  <button
                    key={label}
                    onClick={() => loadProfile(profile)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Monthly Expenses ($)</label>
                <input
                  type="number" value={expenses}
                  onChange={e => setExpenses(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400">Current Savings ($)</label>
                <input
                  type="number" value={buffer}
                  onChange={e => setBuffer(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Income Table */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Income History</h2>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {incomes.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="month" value={row.date}
                    onChange={e => updateIncome(i, "date", e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none w-32"
                  />
                  <input
                    type="number" value={row.amount}
                    onChange={e => updateIncome(i, "amount", e.target.value)}
                    placeholder="Amount"
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none flex-1"
                  />
                  <button onClick={() => removeRow(i)} className="text-gray-600 hover:text-red-400 text-lg leading-none transition-colors">×</button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className="text-xs text-blue-400 hover:text-blue-300 text-left transition-colors">+ Add month</button>
          </div>

          <button
            onClick={() => { setSmoothing(false); runAnalysis(false); }}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 font-semibold text-sm transition-colors"
          >
            {loading ? "Analyzing..." : "⚡ Run Analysis"}
          </button>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {!result && (
            <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-gray-800 p-16 text-center">
              <div>
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-500 text-sm">Load a profile or enter income data,<br />then click Run Analysis.</p>
              </div>
            </div>
          )}

          {result && (
            <>
              {/* KPI Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-2 md:col-span-1 rounded-2xl border border-gray-800 bg-gray-900 p-5 flex flex-col items-center justify-center">
                  <span className="text-xs uppercase tracking-widest text-gray-400 mb-2">Volatility Score</span>
                  <ScoreRing score={result.features.volatilityScore} />
                </div>

                {/* Shortfall card with before/after badge */}
                <div className={`rounded-2xl border ${shortfallPct >= 50 ? "border-red-900" : shortfallPct >= 25 ? "border-yellow-900" : "border-green-900"} bg-gray-900 p-5 flex flex-col gap-1`}>
                  <span className="text-xs uppercase tracking-widest text-gray-400">Shortfall Risk</span>
                  <span className={`text-3xl font-bold ${shortfallPct >= 50 ? "text-red-400" : shortfallPct >= 25 ? "text-yellow-400" : "text-green-400"}`}>
                    {shortfallPct}%
                  </span>
                  {shortfallDrop !== null && (
                    <span className="text-xs text-green-400 font-semibold">↓ {shortfallDrop}pts with plan</span>
                  )}
                  <span className="text-xs text-gray-500">chance of hitting $0 in 3mo</span>
                </div>

                <KPICard
                  label="Runway"
                  value={`${Math.round(result.features.runwayDays)}d`}
                  sub="days before buffer depletes"
                  color={result.features.runwayDays < 30 ? "border-red-900" : result.features.runwayDays < 60 ? "border-yellow-900" : "border-green-900"}
                />
                <KPICard
                  label="Buffer Target"
                  value={`${result.recommendation.bufferTargetMonths}mo`}
                  sub={`$${Math.round(result.recommendation.targetBuffer).toLocaleString()} recommended`}
                  color="border-blue-900"
                />
              </div>

              {/* Chart */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
                    3-Month Buffer Simulation
                    {smoothing && <span className="ml-2 text-green-400 normal-case font-normal text-xs">· Smoothing Plan Active</span>}
                  </h2>
                  <span className="text-xs text-gray-600">1,000 simulations · bootstrap sampling</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                      formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
                    <Line type="monotone" dataKey="Best 90%" stroke="#22c55e" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="Median" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
                    <Line type="monotone" dataKey="Worst 10%" stroke="#ef4444" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendation + Smoothing toggle */}
              <div className="rounded-2xl border border-blue-900 bg-gray-900 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-400">Recommendation</h2>
                  <button
                    onClick={() => { const next = !smoothing; setSmoothing(next); runAnalysis(next); }}
                    disabled={loading}
                    className={`flex items-center gap-2 text-xs px-4 py-2 rounded-full border transition-all font-semibold ${
                      smoothing
                        ? "bg-green-900 border-green-600 text-green-300"
                        : "bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${smoothing ? "bg-green-400" : "bg-gray-600"}`} />
                    {loading ? "Recalculating..." : smoothing ? "✅ Smoothing Plan ON" : "Enable Income Smoothing"}
                  </button>
                </div>
                <p className="text-white text-sm leading-relaxed">{result.recommendation.routingRuleText}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-lg font-bold text-white">{result.recommendation.bufferTargetMonths}x</div>
                    <div className="text-xs text-gray-500">months target</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-lg font-bold text-white">${Math.round(result.recommendation.gap).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">gap to fill</div>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3">
                    <div className="text-lg font-bold text-white">{Math.round(result.recommendation.routePct * 100)}%</div>
                    <div className="text-xs text-gray-500">of surplus to route</div>
                  </div>
                </div>
              </div>

              {/* Explanation Bullets */}
              <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Why This Assessment</h2>
                <ul className="flex flex-col gap-2">
                  {result.explanation.map((line, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-blue-400 mt-0.5">›</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}