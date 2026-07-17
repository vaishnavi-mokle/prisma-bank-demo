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

module.exports = router;