import { NextRequest, NextResponse } from "next/server";
import { analyze } from "@/lib/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.incomes || !Array.isArray(body.incomes) || body.incomes.length === 0) {
      return NextResponse.json({ error: "At least one income entry is required." }, { status: 400 });
    }
    if (!body.monthlyExpenses || body.monthlyExpenses <= 0) {
      return NextResponse.json({ error: "Monthly expenses must be greater than 0." }, { status: 400 });
    }

    const input = {
      incomes: body.incomes,
      monthlyExpenses: Number(body.monthlyExpenses),
      currentBuffer: Number(body.currentBuffer ?? 0),
      horizonMonths: Number(body.horizonMonths ?? 3),
      //simulations: Number(body.simulations ?? 1000),
      simulations: Number(body.simulations ?? 2000),
      applySmoothing: Boolean(body.applySmoothing ?? false),
    };

    const result = analyze(input);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}