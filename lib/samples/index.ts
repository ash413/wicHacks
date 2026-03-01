import { ProfileInput } from "@/types";

export const gigWorkerProfile: ProfileInput = {
  monthlyExpenses: 2200,
  currentBuffer: 1800,
  horizonMonths: 3,
  simulations: 2000,
  incomes: [
    { date: "2024-01", amount: 2100 },
    { date: "2024-02", amount: 4800 },
    { date: "2024-03", amount: 1500 },
    { date: "2024-04", amount: 3900 },
    { date: "2024-05", amount: 900 },
    { date: "2024-06", amount: 5200 },
    { date: "2024-07", amount: 2800 },
    { date: "2024-08", amount: 1100 },
    { date: "2024-09", amount: 4100 },
    { date: "2024-10", amount: 600 },
    { date: "2024-11", amount: 3700 },
    { date: "2024-12", amount: 2400 },
  ],
};

export const creatorProfile: ProfileInput = {
  monthlyExpenses: 2500,
  currentBuffer: 2000,
  horizonMonths: 3,
  simulations: 2000,
  incomes: [
    { date: "2024-01", amount: 800 },
    { date: "2024-02", amount: 12000 },
    { date: "2024-03", amount: 1200 },
    { date: "2024-04", amount: 600 },
    { date: "2024-05", amount: 9500 },
    { date: "2024-06", amount: 700 },
    { date: "2024-07", amount: 400 },
    { date: "2024-08", amount: 11000 },
    { date: "2024-09", amount: 900 },
    { date: "2024-10", amount: 500 },
    { date: "2024-11", amount: 8200 },
    { date: "2024-12", amount: 1100 },
  ],
};

export const freelancerProfile: ProfileInput = {
  monthlyExpenses: 2800,
  currentBuffer: 5000,
  horizonMonths: 3,
  simulations: 2000,
  incomes: [
    { date: "2024-01", amount: 5500 },
    { date: "2024-02", amount: 3200 },
    { date: "2024-03", amount: 4800 },
    { date: "2024-04", amount: 2100 },
    { date: "2024-05", amount: 6200 },
    { date: "2024-06", amount: 3900 },
    { date: "2024-07", amount: 2600 },
    { date: "2024-08", amount: 5100 },
    { date: "2024-09", amount: 1800 },
    { date: "2024-10", amount: 4400 },
    { date: "2024-11", amount: 3300 },
    { date: "2024-12", amount: 5800 },
  ],
};

// ─── 60-month CSV profile configs ────────────────────────────
export const gigWorker60Profile = {
  label: "🚗 Gig Worker (5yr)",
  csvFile: "gig_60mo.csv",
  monthlyExpenses: 2200,
  currentBuffer: 1800,
  horizonMonths: 3,
  simulations: 2000,
};

export const creator60Profile = {
  label: "🎨 Creator (5yr)",
  csvFile: "creator_60mo.csv",
  monthlyExpenses: 2500,
  currentBuffer: 2000,
  horizonMonths: 3,
  simulations: 2000,
};

export const freelancer60Profile = {
  label: "💻 Freelancer (5yr)",
  csvFile: "freelancer_60mo.csv",
  monthlyExpenses: 2800,
  currentBuffer: 5000,
  horizonMonths: 3,
  simulations: 2000,
};