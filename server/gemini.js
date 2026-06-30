import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate a response using Google Gemini.
 * @param {Array} history - The chat history array, e.g., [{ role: 'user', parts: [{text: '...'}] }]
 * @returns {Promise<string>} The generated AI text response
 */
export async function generateChatResponse(history) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: history,
    });
    return response.text;
  } catch (error) {
    console.error('Error generating Gemini response:', error);
    throw error;
  }
}
