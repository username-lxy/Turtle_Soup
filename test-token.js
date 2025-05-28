const axios = require('axios');

async function testTokenAPI() {
    try {
        const response = await axios.get('http://turtlesoup-api.monadshow.xyz/api/v1/activity/token', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testTokenAPI(); 