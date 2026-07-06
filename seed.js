const { Prisma } = require("@prisma/client");
const prisma = require("./db");
async function main() {
  console.log("Starting seed...");

  
  console.log(" Inserting users...");

  await prisma.user.createMany({
    data: [
      { name: "Vamshi", email: "vamshi@gmail.com" },
      { name: "Rahul", email: "rahul@gmail.com" },
      { name: "Anjali", email: "anjali@gmail.com" },
      { name: "Kiran", email: "kiran@gmail.com" },
      { name: "Sneha", email: "sneha@gmail.com" },
    ],
  });

  console.log(" Users inserted.");

  
  console.log(" Inserting accounts...");

  await prisma.account.createMany({
    data: [
      {
        accountNumber: "100001",
        balance: new Prisma.Decimal(5000),
        userId: 1,
      },
      {
        accountNumber: "100002",
        balance: new Prisma.Decimal(7000),
        userId: 2,
      },
      {
        accountNumber: "100003",
        balance: new Prisma.Decimal(3000),
        userId: 3,
      },
      {
        accountNumber: "100004",
        balance: new Prisma.Decimal(9000),
        userId: 4,
      },
      {
        accountNumber: "100005",
        balance: new Prisma.Decimal(12000),
        userId: 5,
      },
    ],
  });

  console.log("✅ Accounts inserted.");

  // ---------------- TRANSACTIONS ----------------
  console.log(" Inserting transactions...");

  await prisma.transaction.createMany({
    data: [
      {
        amount: new Prisma.Decimal(1000),
        type: "DEPOSIT",
        accountId: 1,
      },
      {
        amount: new Prisma.Decimal(500),
        type: "WITHDRAW",
        accountId: 2,
      },
      {
        amount: new Prisma.Decimal(1500),
        type: "DEPOSIT",
        accountId: 3,
      },
      {
        amount: new Prisma.Decimal(800),
        type: "WITHDRAW",
        accountId: 4,
      },
      {
        amount: new Prisma.Decimal(2000),
        type: "DEPOSIT",
        accountId: 5,
      },
    ],
  });

  console.log("Transactions inserted.");

  // ---------------- LEDGER ----------------
  console.log("Inserting ledger entries...");

  await prisma.ledgerEntry.createMany({
    data: [
      {
        entryType: "CREDIT",
        amount: new Prisma.Decimal(1000),
        balanceAfter: new Prisma.Decimal(6000),
        accountId: 1,
        transactionId: 1,
      },
      {
        entryType: "DEBIT",
        amount: new Prisma.Decimal(500),
        balanceAfter: new Prisma.Decimal(6500),
        accountId: 2,
        transactionId: 2,
      },
      {
        entryType: "CREDIT",
        amount: new Prisma.Decimal(1500),
        balanceAfter: new Prisma.Decimal(4500),
        accountId: 3,
        transactionId: 3,
      },
      {
        entryType: "DEBIT",
        amount: new Prisma.Decimal(800),
        balanceAfter: new Prisma.Decimal(8200),
        accountId: 4,
        transactionId: 4,
      },
      {
        entryType: "CREDIT",
        amount: new Prisma.Decimal(2000),
        balanceAfter: new Prisma.Decimal(14000),
        accountId: 5,
        transactionId: 5,
      },
    ],
  });

  console.log(" Ledger entries inserted.");
  console.log("Sample data inserted successfully.");
}

main()
  .catch((error) => {
    console.error("Error while seeding:");
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
