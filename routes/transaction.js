const express = require("express");
const { Prisma } = require("@prisma/client");
const prisma = require("../db");

const router = express.Router();
// GET All Transactions
// Search Transactions
router.get("/search", async (req, res) => {
    try {

        const { type, accountId } = req.query;

        const where = {};

        if (type) {
            where.type = type;
        }

        if (accountId) {
            where.accountId = parseInt(accountId);
        }

        const transactions = await prisma.transaction.findMany({
            where
        });

        if (transactions.length === 0) {
            return res.status(404).json({
                message: "No transactions found"
            });
        }

        res.json(transactions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
router.post("/withdraw", async (req, res) => {

    const { accountId, amount } = req.body;

    try {

        const result = await prisma.$transaction(

            async (tx) => {

                // Lock the account row
                const accounts = await tx.$queryRaw`
                    SELECT *
                    FROM "Account"
                    WHERE id = ${accountId}
                    FOR UPDATE
                `;

                if (accounts.length === 0) {
                    throw new Error("Account not found");
                }

                const account = accounts[0];

                console.log("--------------------------------");
                console.log("Account Locked");
                console.log("Current Balance:", Number(account.balance));
                console.log("Requested Amount:", amount);

                // Simulate long processing
                await new Promise(resolve => setTimeout(resolve, 10000));

                if (Number(account.balance) < amount) {
                    throw new Error("Insufficient Balance");
                }

                const newBalance = Number(account.balance) - amount;

                await tx.account.update({
                    where: {
                        id: accountId
                    },
                    data: {
                        balance: newBalance
                    }
                });

                console.log("Balance Updated:", newBalance);
                console.log("Transaction Completed");
                console.log("--------------------------------");

                return {
                    message: "Withdrawal Successful",
                    balance: newBalance
                };

            },

            {
                timeout: 30000
            }

        );

        res.json(result);

    } catch (err) {

        console.error("Transaction Error:");
        console.error(err);

        res.status(400).json({
            message: err.message
        });

    }

});

router.post("/transfer", async (req, res) => {

    const { fromAccountId, toAccountId, amount } = req.body;

    try {

        const result = await prisma.$transaction(async (tx) => {

            // Lock sender account
            const senderAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${fromAccountId}
                FOR UPDATE
            `;

            if (senderAccounts.length === 0) {
                throw new Error("Sender account not found");
            }

            const sender = senderAccounts[0];

            console.log("--------------------------------");
            console.log(`Transfer: Account ${fromAccountId} ➜ Account ${toAccountId}`);
            console.log(`Transfer Amount : ${amount}`);
            console.log(`Sender Balance Before : ${sender.balance}`);

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 5000));

            if (Number(sender.balance) < amount) {
                throw new Error("Insufficient Balance");
            }

            // Lock receiver account
            const receiverAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${toAccountId}
                FOR UPDATE
            `;

            if (receiverAccounts.length === 0) {
                throw new Error("Receiver account not found");
            }

            const receiver = receiverAccounts[0];

            const senderNewBalance = Number(sender.balance) - amount;
            const receiverNewBalance = Number(receiver.balance) + amount;

            // Update sender
            await tx.account.update({
                where: {
                    id: fromAccountId
                },
                data: {
                    balance: senderNewBalance
                }
            });

            // Update receiver
            await tx.account.update({
                where: {
                    id: toAccountId
                },
                data: {
                    balance: receiverNewBalance
                }
            });

            console.log(`Sender Balance After  : ${senderNewBalance}`);
            console.log(`Receiver Balance After: ${receiverNewBalance}`);
            console.log("Transfer Successful");
            console.log("--------------------------------");

            return {
                message: "Transfer Successful",
                senderBalance: senderNewBalance,
                receiverBalance: receiverNewBalance
            };

        }, {
            timeout: 30000
        });

        res.json(result);

    } catch (err) {

        console.log("--------------------------------");
        console.log("Transfer Failed");
        console.log(err.message);
        console.log("--------------------------------");

        res.status(400).json({
            message: err.message
        });

    }

});

router.post("/transfer-credit", async (req, res) => {

    const { fromAccountId, toAccountId, amount } = req.body;

    try {

        const result = await prisma.$transaction(async (tx) => {

            // Lock sender
            const senderAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${fromAccountId}
                FOR UPDATE
            `;

            if (senderAccounts.length === 0) {
                throw new Error("Sender not found");
            }

            const sender = senderAccounts[0];

            if (Number(sender.balance) < amount) {
                throw new Error("Insufficient Balance");
            }

            // Lock receiver
            const receiverAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${toAccountId}
                FOR UPDATE
            `;

            if (receiverAccounts.length === 0) {
                throw new Error("Receiver not found");
            }

            const receiver = receiverAccounts[0];

            console.log("--------------------------------");
            console.log(`Transfer: ${fromAccountId} → ${toAccountId}`);

            console.log("Sender Balance Before:", sender.balance);
            console.log("Receiver Balance Before:", receiver.balance);

            const senderNewBalance = Number(sender.balance) - amount;
            const receiverNewBalance = Number(receiver.balance) + amount;

            await tx.account.update({
                where: {
                    id: fromAccountId
                },
                data: {
                    balance: senderNewBalance
                }
            });

            await tx.account.update({
                where: {
                    id: toAccountId
                },
                data: {
                    balance: receiverNewBalance
                }
            });

            console.log("Transferred:", amount);
            console.log("Sender Balance After:", senderNewBalance);
            console.log("Receiver Balance After:", receiverNewBalance);
            console.log("--------------------------------");

            return {
                message: "Transfer Successful",
                receiverBalance: receiverNewBalance
            };
        }, {
            timeout: 30000
        });

        res.json(result);

    } catch (err) {

        res.status(400).json({
            message: err.message
        });

    }

});
router.post("/transfer-idempotent", async (req, res) => {

    const {
        idempotencyKey,
        fromAccountId,
        toAccountId,
        amount
    } = req.body;

    try {

        const result = await prisma.$transaction(async (tx) => {

            // Step 1: Register the request
            await tx.transferRequest.create({
                data: {
                    idempotencyKey,
                    fromAccountId,
                    toAccountId,
                    amount,
                    status: "PROCESSING"
                }
            });

            // Step 2: Lock sender
            const senderAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${fromAccountId}
                FOR UPDATE
            `;

            if (senderAccounts.length === 0) {
                throw new Error("Sender account not found");
            }

            const sender = senderAccounts[0];

            console.log("--------------------------------");
            console.log("Idempotent Transfer");
            console.log("Key:", idempotencyKey);
            console.log(`Transfer: ${fromAccountId} ➜ ${toAccountId}`);
            console.log("Sender Balance Before:", sender.balance);

            if (Number(sender.balance) < amount) {
                throw new Error("Insufficient Balance");
            }

            // Step 3: Lock receiver
            const receiverAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${toAccountId}
                FOR UPDATE
            `;

            if (receiverAccounts.length === 0) {
                throw new Error("Receiver account not found");
            }

            const receiver = receiverAccounts[0];

            const senderNewBalance = Number(sender.balance) - amount;
            const receiverNewBalance = Number(receiver.balance) + amount;

            // Step 4: Debit sender
            await tx.account.update({
                where: {
                    id: fromAccountId
                },
                data: {
                    balance: senderNewBalance
                }
            });

            // Step 5: Credit receiver
            await tx.account.update({
                where: {
                    id: toAccountId
                },
                data: {
                    balance: receiverNewBalance
                }
            });

            // Step 6: Mark as completed
            const transactionId = `TXN${Date.now()}`;

            await tx.transferRequest.update({
                where: {
                    idempotencyKey
                },
                data: {
                    transactionId,
                    status: "SUCCESS"
                }
            });

            console.log("Transferred:", amount);
            console.log("Sender Balance After:", senderNewBalance);
            console.log("Receiver Balance After:", receiverNewBalance);
            console.log("--------------------------------");

            return {
                message: "Transfer Successful",
                transactionId,
                senderBalance: senderNewBalance,
                receiverBalance: receiverNewBalance
            };

        }, {
            timeout: 30000
        });

        res.json(result);

    } catch (err) {

        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === "P2002"
        ) {
            return res.status(200).json({
                message: "Already Processed"
            });
        }

        res.status(400).json({
            message: err.message
        });

    }

});

router.post("/atomic-transfer", async (req, res) => {

    const { fromAccountId, toAccountId, amount } = req.body;

    try {

        const result = await prisma.$transaction(async (tx) => {

            // Lock sender
            const senderAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${fromAccountId}
                FOR UPDATE
            `;

            if (senderAccounts.length === 0) {
                throw new Error("Sender not found");
            }

            const sender = senderAccounts[0];

            // Lock receiver
            const receiverAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${toAccountId}
                FOR UPDATE
            `;

            if (receiverAccounts.length === 0) {
                throw new Error("Receiver not found");
            }

            const receiver = receiverAccounts[0];

            console.log("--------------------------------");
            console.log("Atomic Transfer Started");
            console.log(`Transfer : ${fromAccountId} → ${toAccountId}`);
            console.log("Sender Balance Before :", sender.balance);
            console.log("Receiver Balance Before :", receiver.balance);

            if (Number(sender.balance) < amount) {
                throw new Error("Insufficient Balance");
            }

            const senderNewBalance = Number(sender.balance) - amount;
            const receiverNewBalance = Number(receiver.balance) + amount;


            console.log("Sender New Balance (Temporary):", senderNewBalance);
            console.log("Receiver New Balance (Temporary):", receiverNewBalance);

            // Debit sender
            await tx.account.update({
                where: { id: fromAccountId },
                data: {
                    balance: senderNewBalance
                }
            });

            // Credit receiver
            await tx.account.update({
                where: { id: toAccountId },
                data: {
                    balance: receiverNewBalance
                }
            });

            console.log("Database rows updated inside transaction.");
            console.log("These changes are NOT committed yet.");

            // Create transaction
            const transaction = await tx.transaction.create({
                data: {
                    amount,
                    type: "TRANSFER",
                    accountId: fromAccountId
                }
            });

            console.log("Transaction Created");

            // Create sender ledger entry
            await tx.ledgerEntry.create({
                data: {
                    entryType: "DEBIT",
                    amount,
                    balanceAfter: senderNewBalance,
                    accountId: fromAccountId,
                    transactionId: transaction.id
                }
            });
            // Simulate notification failure
            throw new Error("Notification Service Failed");

        });

        res.json(result);

    } catch (err) {

        console.log("--------------------------------");
        console.log("Atomic Transaction Rolled Back");
        console.log("Reason:", err.message);
        console.log("--------------------------------");

        res.status(400).json({
            message: err.message
        });

    }

});

router.post("/transfer-chain", async (req, res) => {

    const { fromAccountId, toAccountId, amount } = req.body;

    try {

        const result = await prisma.$transaction(async (tx) => {

            // Lock sender
            const senderAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${fromAccountId}
                FOR UPDATE
            `;

            if (senderAccounts.length === 0) {
                throw new Error("Sender not found");
            }

            const sender = senderAccounts[0];

            if (Number(sender.balance) < amount) {
                throw new Error("Insufficient Balance");
            }

            // Lock receiver
            const receiverAccounts = await tx.$queryRaw`
                SELECT *
                FROM "Account"
                WHERE id = ${toAccountId}
                FOR UPDATE
            `;

            if (receiverAccounts.length === 0) {
                throw new Error("Receiver not found");
            }

            const receiver = receiverAccounts[0];

            console.log("--------------------------------");
            console.log(`Chain Transfer: ${fromAccountId} → ${toAccountId}`);
            console.log("Sender Balance Before:", sender.balance);
            console.log("Receiver Balance Before:", receiver.balance);

            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 5000));

            const senderNewBalance = Number(sender.balance) - amount;
            const receiverNewBalance = Number(receiver.balance) + amount;

            // Debit sender
            await tx.account.update({
                where: {
                    id: fromAccountId
                },
                data: {
                    balance: senderNewBalance
                }
            });

            // Credit receiver
            await tx.account.update({
                where: {
                    id: toAccountId
                },
                data: {
                    balance: receiverNewBalance
                }
            });

            console.log("Transferred:", amount);
            console.log("Sender Balance After:", senderNewBalance);
            console.log("Receiver Balance After:", receiverNewBalance);
            console.log("--------------------------------");

            return {
                message: "Transfer Successful",
                senderBalance: senderNewBalance,
                receiverBalance: receiverNewBalance
            };

        }, {
            timeout: 30000
        });

        res.json(result);

    } catch (err) {

        res.status(400).json({
            message: err.message
        });

    }

});

module.exports = router;