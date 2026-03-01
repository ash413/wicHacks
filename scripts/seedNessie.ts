const API_KEY = "1b9e97d2d8fee011b1d38ced20ae06c3";
const BASE = "http://api.nessieisreal.com";

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log(`POST ${path}:`, JSON.stringify(data));
  return data;
}

async function seed() {
  // 1. Create customer
  console.log("\n--- Creating customer ---");
  const customerRes = await post("/customers", {
    first_name: "Alex",
    last_name: "GigWorker",
    address: {
      street_number: "123",
      street_name: "Main St",
      city: "Rochester",
      state: "NY",
      zip: "14620",
    },
  });
  const customerId = customerRes.objectCreated?._id;
  if (!customerId) { console.error("Failed to create customer"); return; }
  console.log("Customer ID:", customerId);

  // 2. Create checking account
  console.log("\n--- Creating checking account ---");
  const accountRes = await post(`/customers/${customerId}/accounts`, {
    type: "Checking",
    nickname: "Gig Income Account",
    rewards: 0,
    balance: 1800,
  });
  const accountId = accountRes.objectCreated?._id;
  if (!accountId) { console.error("Failed to create account"); return; }
  console.log("Account ID:", accountId);

  // 3. Create deposits (income) for 12 months
  console.log("\n--- Creating deposits ---");
  const deposits = [
    { date: "2024-01-15", amount: 2000 },
    { date: "2024-02-15", amount: 1900 },
    { date: "2024-03-15", amount: 2100 },
    { date: "2024-04-15", amount: 700 },
    { date: "2024-05-15", amount: 2300 },
    { date: "2024-06-15", amount: 3200 },
    { date: "2024-07-15", amount: 3400 },
    { date: "2024-08-15", amount: 3100 },
    { date: "2024-09-15", amount: 2500 },
    { date: "2024-10-15", amount: 4800 },
    { date: "2024-11-15", amount: 2200 },
    { date: "2024-12-15", amount: 1500 },
  ];

  for (const d of deposits) {
    await post(`/accounts/${accountId}/deposits`, {
      medium: "balance",
      transaction_date: d.date,
      amount: d.amount,
      description: "Gig income deposit",
    });
  }

  console.log("\n✅ Done! Save these IDs:");
  console.log(`  Customer ID: ${customerId}`);
  console.log(`  Account ID:  ${accountId}`);
}

seed().catch(console.error);