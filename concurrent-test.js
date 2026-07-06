const axios = require("axios");

async function testConcurrentWithdrawals() {

    const request1 = axios.post(
        "http://localhost:3000/transaction/withdraw",
        {
            accountId: 1,
            amount: 6000
        }
    );

    const request2 = axios.post(
        "http://localhost:3000/transaction/withdraw",
        {
            accountId: 1,
            amount: 5000
        }
    );

    const results = await Promise.allSettled([request1, request2]);

    console.log("\n========= RESULT =========\n");

    results.forEach((result, index) => {

        console.log(`Request ${index + 1}`);

        if (result.status === "fulfilled") {
            console.log(result.value.data);
        } else {
            console.log(result.reason.response.data);
        }

        console.log("------------------------");

    });

}

testConcurrentWithdrawals();