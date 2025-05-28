const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.post('http://turtlesoup-api.monadshow.xyz/api/v1/session/token', {
            activityToken: "5e456f62-86b6-4b22-a3aa-ab2fb8e8938b"
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testAPI(); 