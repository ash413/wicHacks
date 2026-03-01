import { NextResponse } from "next/server";
import { nessieToIncomePoints } from "@/lib/adapters/nessie";

const ACCOUNT_IDS: Record<string, string> = {
  gig: process.env.NESSIE_ACCOUNT_GIG ?? "",
  creator: process.env.NESSIE_ACCOUNT_CREATOR ?? "",
  freelancer: process.env.NESSIE_ACCOUNT_FREELANCER ?? "",
};

const ACCOUNT_NAMES: Record<string, string> = {
  gig: "Gig Income Account",
  creator: "Creator Income Account",
  freelancer: "Freelancer Income Account",
};

const BALANCES: Record<string, number> = {
  gig: 1800,
  creator: 2000,
  freelancer: 5000,
};

// Per-profile cache
const cache: Record<string, { data: Record<string, unknown>; fetchedAt: number }> = {};
const CACHE_TTL = 1000 * 60 * 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profile = searchParams.get("profile") ?? "gig";

  if (!ACCOUNT_IDS[profile]) {
    return NextResponse.json({ error: `Unknown profile: ${profile}` }, { status: 400 });
  }

  try {
    // Return cached if fresh
    if (cache[profile] && Date.now() - cache[profile].fetchedAt < CACHE_TTL) {
      return NextResponse.json({ ...cache[profile].data, cached: true });
    }

    const accountId = ACCOUNT_IDS[profile];
    const incomes = await nessieToIncomePoints(accountId);

    const result = {
      incomes,
      currentBalance: BALANCES[profile],
      accountName: ACCOUNT_NAMES[profile],
      profile,
    };

    cache[profile] = { data: result, fetchedAt: Date.now() };
    return NextResponse.json(result);

  } catch (err) {
    console.error("Nessie fetch error:", err);
    return NextResponse.json(
      { error: "Nessie unavailable", detail: String(err) },
      { status: 503 }
    );
  }
}