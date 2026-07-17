const express = require("express");
const prisma = require("../db");

const router = express.Router();

// GET All Accounts
router.get("/", async (req, res) => {
    try {

        const accounts = await prisma.account.findMany();

        res.json(accounts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// Search Account by Account Number
router.get("/search", async (req, res) => {
    try {

        const { accountNumber } = req.query;

        const account = await prisma.account.findFirst({
            where: {
                accountNumber: accountNumber
            }
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        res.json(account);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});
// GET Account by ID
router.get("/:id", async (req, res) => {
    try {

        const id = parseInt(req.params.id);

        const account = await prisma.account.findUnique({
            where: {
                id: id
            }
        });

        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }

        res.json(account);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;