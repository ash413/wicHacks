import { IncomePoint } from "@/types";

export function parseCSV(csvText: string): IncomePoint[] {
  const lines = csvText.trim().split("\n");
  const header = lines[0].toLowerCase();
  
  if (!header.includes("date") || !header.includes("amount")) {
    throw new Error("CSV must have 'date' and 'amount' columns");
  }

  const results: IncomePoint[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [date, amountStr] = line.split(",");
    const amount = parseInt(amountStr?.trim(), 10);
    
    if (!date || isNaN(amount)) {
      console.warn(`Skipping invalid row ${i}: "${line}"`);
      continue;
    }
    
    results.push({
      date: date.trim().slice(0, 7), // ensure YYYY-MM
      amount,
    });
  }

  return results;
}