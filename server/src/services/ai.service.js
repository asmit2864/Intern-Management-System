const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a chat response from Gemini based on the candidate's resume context.
 * 
 * @param {Array} history - Previous chat history
 * @param {string} resumeText - Full raw text of the candidate's resume
 * @param {string} userQuery - The question/query from the manager
 * @returns {Promise<string>} - The LLM's response
 */
exports.getChatResponse = async (history, resumeText, userQuery) => {
    try {
        // --- OPTIMIZATION: Clean and Truncate Resume Text ---
        // 1. Remove excess whitespace and newlines to save tokens
        let cleanText = (resumeText || '')
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();

        // 2. Truncate to ~10,000 characters (approx 2,500 words)
        // This is more than enough for a resume while preventing 429 TPM errors.
        if (cleanText.length > 10000) {
            cleanText = cleanText.substring(0, 10000) + '... [Resume text truncated for length]';
        }

        // --- MODEL CONFIGURATION ---
        // Use systemInstruction for a cleaner persona management
        const systemPrompt = `
You are a specialized "Hiring Assistant" for an Intern Management system.
Your goal is to answer questions about a candidate STRICTLY based on the provided resume text.

RESUME CONTENT:
---
${cleanText}
---

FORMATTING RULES:
1. **Natural & Concise**: Speak professionally but naturally. Keep answers short and direct.
2. **Selective Boldness**: Use **Bold Headings** only for structured insights or lists. For basic questions or greetings, just reply naturally.
3. **Evidence-Based**: Always base your analytical insights on the provided resume content.
4. **Clean Layout**: Use clear paragraph breaks or simple lists. Avoid excessive nesting.

GUARDRAILS:
1. ONLY answer questions related to hiring, skills, suitability, OR provide polite greetings.
2. If asked anything completely unrelated to hiring or the student, reply: "I only answer queries related to your hiring doubts of students."
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(userQuery);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error('Failed to get a response from the AI assistant. Quota might be reached or connection failed.');
    }
};
