const axios = require("axios");

async function testConcurrentCredits() {

    const request1 = axios.post(
        "http://localhost:3000/transaction/transfer-credit",
        {
            fromAccountId: 1,
            toAccountId: 3,
            amount: 6000
        }
    );

    const request2 = axios.post(
        "http://localhost:3000/transaction/transfer-credit",
        {
            fromAccountId: 2,
            toAccountId: 3,
            amount: 4000
        }
    );

    const results = await Promise.allSettled([request1, request2]);

    console.log("\n========= RESULT =========\n");

    console.log("Transfer 1");
    console.log(
        results[0].status === "fulfilled"
            ? results[0].value.data
            : results[0].reason.response.data
    );

    console.log("------------------------");

    console.log("Transfer 2");
    console.log(
        results[1].status === "fulfilled"
            ? results[1].value.data
            : results[1].reason.response.data
    );

    console.log("------------------------");
}

testConcurrentCredits();