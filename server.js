const express = require("express");

const transactionRoutes = require("./routes/transaction");
const accountRoutes = require("./routes/account");
const ledgerRoutes = require("./routes/ledger");

const app = express();

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Banking API",
        status: "Running",
        version: "1.0.0"
    });
});

app.use("/transaction", transactionRoutes);
app.use("/account", accountRoutes);
app.use("/ledger", ledgerRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});