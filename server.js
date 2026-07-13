const express = require("express");

const transactionRoutes = require("./routes/transaction");

const app = express();

app.use(express.json());

app.use("/transaction", transactionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});