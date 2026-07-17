const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET All Ledger Entries
router.get("/", async (req, res) => {
    try {

        const ledgerEntries = await prisma.ledgerEntry.findMany();

        res.json(ledgerEntries);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// GET Ledger Entries by Account ID
router.get("/account/:accountId", async (req, res) => {
    try {

        const accountId = parseInt(req.params.accountId);

        const ledgerEntries = await prisma.ledgerEntry.findMany({
            where: {
                accountId: accountId
            }
        });

        if (ledgerEntries.length === 0) {
            return res.status(404).json({
                message: "No ledger entries found"
            });
        }

        res.json(ledgerEntries);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// GET Ledger Entries by Transaction ID
router.get("/transaction/:transactionId", async (req, res) => {
    try {

        const transactionId = parseInt(req.params.transactionId);

        const ledgerEntries = await prisma.ledgerEntry.findMany({
            where: {
                transactionId: transactionId
            }
        });

        if (ledgerEntries.length === 0) {
            return res.status(404).json({
                message: "No ledger entries found"
            });
        }

        res.json(ledgerEntries);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// GET Ledger Entry by ID
router.get("/:id", async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const ledger = await prisma.ledgerEntry.findUnique({
            where: {
                id: id
            }
        });

        if (!ledger) {
            return res.status(404).json({
                message: "Ledger entry not found"
            });
        }

        res.json(ledger);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;