import { NextResponse } from "next/server";
import { fetchNessieProfile } from "@/lib/adapters/nessie";

// Cache response in memory to survive demo conditions
//let cache: { data: unknown; fetchedAt: number } | null = null;
let cache: { data: Record<string, unknown>; fetchedAt: number } | null = null;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    const profile = await fetchNessieProfile();

    // Flatten all income points across accounts
    const allIncome = Object.values(profile.incomeByAccount).flat();

    // Group by month and sum across all accounts
    const monthMap: Record<string, number> = {};
    for (const { date, amount } of allIncome) {
      monthMap[date] = (monthMap[date] ?? 0) + amount;
    }

    const incomes = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    const result = {
      incomes,
      currentBalance: profile.currentBalance,
      accountCount: profile.accounts.length,
      accounts: profile.accounts.map(a => ({
        id: a._id,
        nickname: a.nickname,
        type: a.type,
        balance: a.balance,
      })),
    };

    cache = { data: result, fetchedAt: Date.now() };
    return NextResponse.json(result);

  } catch (err) {
    console.error("Nessie fetch error:", err);
    return NextResponse.json(
      { error: "Nessie unavailable", detail: String(err) },
      { status: 503 }
    );
  }
}