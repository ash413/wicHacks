

---

# 🔥 Income Firewall

> Seasonality-Aware Cash Flow Volatility Risk Engine
> [https://income-firewall.vercel.app/](https://income-firewall.vercel.app/)

---

## 🚨 The Problem

Variable-income professionals don’t fail financially because they overspend.

They fail because income is volatile.

A creator can earn $12,000 in one month and $400 the next.
A freelancer can have back-to-back contracts followed by a gap month.
A gig worker may face seasonality, injury months, or demand shocks.

With fixed expenses, volatility becomes a **probability problem**, not a budgeting problem.

**The real question is:**

> What’s the probability I hit $0 in the next 3 months?
> And what policy reduces that risk?

---

## 🧠 The Solution

**Income Firewall** is a volatility risk engine that:

* Normalizes income history into monthly cashflow series
* Quantifies volatility using statistical features
* Runs seasonality-aware Monte Carlo simulations
* Estimates shortfall probability over a forward horizon
* Generates a personalized income smoothing policy
* Backtests that policy on historical data
* Provides stable A/B comparison using Common Random Numbers (CRN)

This is not a budgeting tracker.
It’s a **cash flow risk modeling prototype.**

---

## 📊 What It Calculates

### Risk Metrics

* Average income
* Standard deviation
* Coefficient of variation (CV)
* % of months below expenses
* Runway days
* Volatility score (0–100)
* Probability of hitting $0 (Monte Carlo)

### Policy Recommendation

* Target buffer (months of expenses)
* Gap to target
* % of surplus income to route into buffer
* Plain-English routing rule

### Backtest Engine

* Replays historical income
* Simulates deposits/releases
* Tracks:

  * Total deposited
  * Total released
  * Buffer trajectory
  * Months fully covered

---

## 🎲 Modeling Approach

### 1️⃣ Empirical Bootstrap (not Gaussian assumptions)

Income distributions for creators, gig workers, and freelancers are not normal.
We use empirical resampling from historical data.

---

### 2️⃣ Seasonal Bootstrap

Months are bucketed by month-of-year to preserve:

* Q4 creator spikes
* Summer gig demand
* Q3 freelance slowdowns

If buckets are sparse, adjacent months are included.

---

### 3️⃣ Common Random Numbers (CRN)

When toggling smoothing ON/OFF, the same random seeds are reused.
This ensures:

* Stable A/B comparison
* Meaningful risk deltas
* Reduced simulation noise

---

### 4️⃣ Backtesting

Policy is replayed on historical income to validate behavior.

---

## 🗂 Data Sources

### 📁 5-Year Synthetic Profiles (CSV)

Located in `public/data/`:

* `creator_60mo.csv`
* `gig_60mo.csv`
* `freelancer_60mo.csv`

Each includes 60 months of realistic structured patterns:

* Seasonality
* Viral spikes
* Drought streaks
* Upward trends

Used to stabilize Monte Carlo and stress-test volatility behavior.

---

### 🏦 Capital One Nessie API (Optional Integration)

Supports live ingestion of:

* Account deposits
* Monthly aggregation
* Current balance

Features:

* Server-side fetching
* 10-minute cache
* Graceful fallback if unavailable

Nessie integration demonstrates bank-grade ingestion architecture.

---

## 🖥 Demo Flow

### Scenario 1 — High Volatility

1. Load **🎨 Creator (5yr)**
2. Run analysis
3. Observe high volatility score + shortfall probability
4. Enable smoothing
5. Observe risk reduction (stable delta via CRN)
6. Scroll to allocation replay + backtest

---

### Scenario 2 — Stable Income

1. Load **💻 Freelancer (5yr)**
2. Run analysis
3. Observe lower volatility and shortfall probability

---

## 🏗 Architecture

```
Frontend (Next.js)
    ↓
/api/analyze → Risk Engine
    ↓
1. Normalize income
2. Compute features
3. Generate policy
4. Monte Carlo simulation
5. Backtest replay
    ↓
Dashboard KPIs + Chart + Allocation Plan
```

---

## ⚙️ Tech Stack

* Next.js 14 (App Router)
* TypeScript
* Recharts
* Tailwind CSS
* Custom Monte Carlo engine (no external ML libraries)
* Capital One Nessie API (optional)

---

## 📦 Project Structure

```
app/
  api/
    analyze/
    nessie/
  page.tsx

lib/
  engine/
  adapters/
  samples/

public/data/
  creator_60mo.csv
  gig_60mo.csv
  freelancer_60mo.csv
```

---

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open:
[http://localhost:3000](http://localhost:3000)

To enable Nessie integration, create `.env.local`:

```
NESSIE_API_KEY=your_key
NESSIE_ACCOUNT_GIG=...
NESSIE_ACCOUNT_CREATOR=...
NESSIE_ACCOUNT_FREELANCER=...
```

---

## 🎯 Why This Project Matters

Variable-income workers are increasing:

* Gig economy
* Creators
* Freelance engineers
* Contract workers

Traditional budgeting tools assume stable paychecks.

Income Firewall reframes personal finance as:

> A volatility management problem.

It demonstrates:

* Modeling discipline
* Stable simulation comparison
* Policy backtesting
* Bank integration architecture
* Full-stack product delivery

---

## ⚠️ Disclaimer

This is a prototype built for educational and hackathon purposes.
Not financial advice.

---

## 🔥 Live Demo

[https://income-firewall.vercel.app/](https://income-firewall.vercel.app/)

---

