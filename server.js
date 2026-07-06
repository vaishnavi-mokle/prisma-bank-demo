const express = require("express");

const transactionRoutes = require("./routes/transaction");

const app = express();

app.use(express.json());

app.use("/transaction", transactionRoutes);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});