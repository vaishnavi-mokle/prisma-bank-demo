const axios = require("axios");

async function testAtomicTransfer() {

    const request = {
        fromAccountId: 1,
        toAccountId: 2,
        amount: 3000
    };

    try {

        const response = await axios.post(
            "http://localhost:3000/transaction/atomic-transfer",
            request
        );

        console.log("\n========= RESULT =========\n");
        console.log(response.data);

    } catch (err) {

        console.log("\n========= RESULT =========\n");

        if (err.response) {
            console.log(err.response.data);
        } else {
            console.log(err.message);
        }

    }

}

testAtomicTransfer();