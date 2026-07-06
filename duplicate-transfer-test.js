const axios = require("axios");

async function testDuplicateTransfer() {

    const transaction = {
        idempotencyKey: "abc124",
        fromAccountId: 1,
        toAccountId: 2,
        amount: 3000
    };

    // Send the same request twice
    const request1 = axios.post(
        "http://localhost:3000/transaction/transfer-idempotent",
        transaction
    );

    const request2 = axios.post(
        "http://localhost:3000/transaction/transfer-idempotent",
        transaction
    );

    const results = await Promise.allSettled([request1, request2]);

    console.log("\n========= RESULT =========\n");

    console.log("Request 1");
    if (results[0].status === "fulfilled") {
        console.log(results[0].value.data);
    } else {
        console.log(results[0].reason.response.data);
    }

    console.log("------------------------");

    console.log("Request 2");
    if (results[1].status === "fulfilled") {
        console.log(results[1].value.data);
    } else {
        console.log(results[1].reason.response.data);
    }

}

testDuplicateTransfer();