const prisma = require("./db");
const fs = require("fs");

async function main() {

    // Fetch data from all tables
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const transactions = await prisma.transaction.findMany();
    const ledgerEntries = await prisma.ledgerEntry.findMany();

    // Users
    let usersCsv = "ID,Name,Email\n";

    users.forEach(user => {
        usersCsv += `${user.id},${user.name},${user.email}\n`;
    });

    fs.writeFileSync("users.csv", usersCsv);

    // Accounts
    let accountsCsv = "ID,Account Number,Balance,User ID\n";

    accounts.forEach(account => {
        accountsCsv += `${account.id},${account.accountNumber},${account.balance},${account.userId}\n`;
    });

    fs.writeFileSync("accounts.csv", accountsCsv);

    // Transactions
    let transactionsCsv = "ID,Amount,Type,Created At,Account ID\n";

    transactions.forEach(transaction => {
        transactionsCsv += `${transaction.id},${transaction.amount},${transaction.type},${transaction.createdAt},${transaction.accountId}\n`;
    });

    fs.writeFileSync("transactions.csv", transactionsCsv);

    // Ledger entry
    let ledgerCsv = "ID,Entry Type,Amount,Balance After,Created At,Account ID,Transaction ID\n";

    ledgerEntries.forEach(entry => {
        ledgerCsv += `${entry.id},${entry.entryType},${entry.amount},${entry.balanceAfter},${entry.createdAt},${entry.accountId},${entry.transactionId}\n`;
    });

    fs.writeFileSync("ledgerEntries.csv", ledgerCsv);

    console.log("CSV files exported successfully!");
}

main()
.catch(console.error)
.finally(async () => {
    await prisma.$disconnect();
});