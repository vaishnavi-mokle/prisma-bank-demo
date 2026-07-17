const express = require("express");

const transactionRoutes = require("./routes/transaction");
const accountRoutes = require("./routes/account");

const app = express();

app.use(express.json());

app.use("/transaction", transactionRoutes);
app.use("/account", accountRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});