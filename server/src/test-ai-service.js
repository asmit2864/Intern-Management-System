const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
console.log(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFix() {
    try {
        console.log('Testing with gemini-2.0-flash on default...');
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent("Say hello");
        console.log('Response:', result.response.text());
        console.log('[SUCCESS]');
    } catch (error) {
        console.log('[FAILED] Default:', error.message);
        console.log('Status:', error.status);

        console.log('\nTesting with gemini-2.0-flash on v1 explicitly...');
        try {
            const modelV1 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: 'v1' });
            const resultV1 = await modelV1.generateContent("Say hello");
            console.log('Response V1:', resultV1.response.text());
            console.log('[SUCCESS V1]');
        } catch (errorV1) {
            console.log('[FAILED] V1:', errorV1.message);
        }
    }
}

testFix();
