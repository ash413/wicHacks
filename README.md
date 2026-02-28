# Income Firewall 🔥
> Cash Flow Volatility Risk Engine for variable-income professionals

## Problem
Gig workers, freelancers, and creators face financial collapse not from 
overspending — but from income variance. A $12k month followed by a $400 
month with fixed expenses of $4,500 is a crisis without a plan.

## Solution
Income Firewall is a volatility risk engine that:
- Quantifies income volatility using statistical modeling (CV, std dev)
- Runs 1,000 Monte Carlo simulations to estimate shortfall probability
- Calculates a personalized adaptive buffer target
- Replays your income history to show exactly how routing would have worked

## Demo Flow
1. Load "🎨 Creator" profile → see 92/100 risk, 73% shortfall probability
2. Scroll to Adaptive Allocation Engine → see how routing works
3. Click "Enable Income Smoothing" → watch shortfall drop
4. Load "💻 Freelancer" → see 36/100, stable, 0% shortfall

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Recharts
- Bootstrap Monte Carlo simulation (no external ML dependencies)

## How to Run
npm install
npm run dev
# Open http://localhost:3000