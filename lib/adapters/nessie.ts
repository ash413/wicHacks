import { IncomePoint } from "@/types";

const BASE = "http://api.nessieisreal.com";
const API_KEY = process.env.NESSIE_API_KEY ?? "";

export interface NessieAccount {
  _id: string;
  type: string;
  nickname: string;
  balance: number;
  customer_id: string;
}

export interface NessieDeposit {
  _id: string;
  amount: number;
  transaction_date: string;
  status: string;
  description: string;
}

export async function fetchNessieAccounts(): Promise<NessieAccount[]> {
  const res = await fetch(`${BASE}/accounts?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Nessie accounts fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchNessieDeposits(accountId: string): Promise<NessieDeposit[]> {
  const res = await fetch(`${BASE}/accounts/${accountId}/deposits?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Nessie deposits fetch failed: ${res.status}`);
  return res.json();
}

export async function nessieToIncomePoints(accountId: string): Promise<IncomePoint[]> {
  const deposits = await fetchNessieDeposits(accountId);

  // Group deposits by YYYY-MM and sum amounts
  const monthMap: Record<string, number> = {};
  for (const deposit of deposits) {
    if (deposit.status === "cancelled") continue;
    const month = deposit.transaction_date.slice(0, 7); // "YYYY-MM"
    monthMap[month] = (monthMap[month] ?? 0) + deposit.amount;
  }

  // Convert to IncomePoint array sorted by date
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));
}

export async function fetchNessieProfile(): Promise<{
  accounts: NessieAccount[];
  incomeByAccount: Record<string, IncomePoint[]>;
  currentBalance: number;
}> {
  const accounts = await fetchNessieAccounts();
  const incomeByAccount: Record<string, IncomePoint[]> = {};
  let currentBalance = 0;

  for (const account of accounts) {
    incomeByAccount[account._id] = await nessieToIncomePoints(account._id);
    currentBalance += account.balance;
  }

  return { accounts, incomeByAccount, currentBalance };
}