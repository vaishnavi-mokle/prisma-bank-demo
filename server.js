const express = require("express");

const transactionRoutes = require("./routes/transaction");

const app = express();

app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the Banking API",
        status: "Running",
        version: "1.0.0"
    });
});

// Transaction Routes
app.use("/transaction", transactionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});