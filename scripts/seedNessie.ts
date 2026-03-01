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

async function seedProfile(
  firstName: string,
  lastName: string,
  nickname: string,
  deposits: { date: string; amount: number }[]
) {
  console.log(`\n--- Creating customer: ${firstName} ${lastName} ---`);
  const customerRes = await post("/customers", {
    first_name: firstName,
    last_name: lastName,
    address: {
      street_number: "123",
      street_name: "Main St",
      city: "Rochester",
      state: "NY",
      zip: "14620",
    },
  });
  const customerId = customerRes.objectCreated?._id;
  if (!customerId) { console.error("Failed to create customer"); return null; }

  console.log(`--- Creating account: ${nickname} ---`);
  const accountRes = await post(`/customers/${customerId}/accounts`, {
    type: "Checking",
    nickname,
    rewards: 0,
    balance: deposits[deposits.length - 1]?.amount ?? 2000,
  });
  const accountId = accountRes.objectCreated?._id;
  if (!accountId) { console.error("Failed to create account"); return null; }

  console.log(`--- Creating ${deposits.length} deposits ---`);
  for (const d of deposits) {
    await post(`/accounts/${accountId}/deposits`, {
      medium: "balance",
      transaction_date: d.date,
      amount: d.amount,
      description: `${nickname} income deposit`,
    });
  }

  return { customerId, accountId };
}

async function seed() {
  // Creator profile
  const creatorResult = await seedProfile(
    "Jordan", "Creator",
    "Creator Income Account",
    [
      { date: "2024-01-15", amount: 800 },
      { date: "2024-02-15", amount: 12000 },
      { date: "2024-03-15", amount: 1200 },
      { date: "2024-04-15", amount: 600 },
      { date: "2024-05-15", amount: 9500 },
      { date: "2024-06-15", amount: 700 },
      { date: "2024-07-15", amount: 400 },
      { date: "2024-08-15", amount: 11000 },
      { date: "2024-09-15", amount: 900 },
      { date: "2024-10-15", amount: 500 },
      { date: "2024-11-15", amount: 8200 },
      { date: "2024-12-15", amount: 1100 },
    ]
  );

  // Freelancer profile
  const freelancerResult = await seedProfile(
    "Sam", "Freelancer",
    "Freelancer Income Account",
    [
      { date: "2024-01-15", amount: 5500 },
      { date: "2024-02-15", amount: 3200 },
      { date: "2024-03-15", amount: 4800 },
      { date: "2024-04-15", amount: 2100 },
      { date: "2024-05-15", amount: 6200 },
      { date: "2024-06-15", amount: 3900 },
      { date: "2024-07-15", amount: 2600 },
      { date: "2024-08-15", amount: 5100 },
      { date: "2024-09-15", amount: 1800 },
      { date: "2024-10-15", amount: 4400 },
      { date: "2024-11-15", amount: 3300 },
      { date: "2024-12-15", amount: 5800 },
    ]
  );

  console.log("\n✅ Done! Add these to your .env.local:");
  console.log(`NESSIE_ACCOUNT_GIG=69a3afb695150878eaffb595`);
  if (creatorResult) console.log(`NESSIE_ACCOUNT_CREATOR=${creatorResult.accountId}`);
  if (freelancerResult) console.log(`NESSIE_ACCOUNT_FREELANCER=${freelancerResult.accountId}`);
}

seed().catch(console.error);