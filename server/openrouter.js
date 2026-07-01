import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

/**
 * Generate a response using OpenRouter AI.
 * @param {Array} history - The chat history array, e.g., [{ role: 'user', parts: [{text: '...'}] }]
 * @returns {Promise<string>} The generated AI text response
 */
export async function generateChatResponse(history) {
  try {
    // Map Gemini-style history to OpenAI-style history expected by OpenRouter
    const messages = history.map((msg) => {
      const text = msg.parts && msg.parts[0] ? msg.parts[0].text : '';
      return {
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: text,
      };
    });

    const modelToUse = process.env.OPENROUTER_MODEL || 'openrouter/free';
    console.log('Using OpenRouter model:', modelToUse);

    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: messages,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating OpenRouter response:', error);
    throw error;
  }
}
