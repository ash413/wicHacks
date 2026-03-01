import { parseCSV } from "./csv";
import { IncomePoint } from "@/types";

export async function loadCSVProfile(filename: string): Promise<IncomePoint[]> {
  const res = await fetch(`/data/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  const text = await res.text();
  return parseCSV(text);
}