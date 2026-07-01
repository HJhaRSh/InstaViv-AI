import express from 'express';
import cors from 'cors';
import { generateChatResponse } from './openrouter.js';
import { generateSpeech } from './tts.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    const { history } = req.body;
    
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ error: 'Invalid or missing history payload' });
    }

    const aiResponseText = await generateChatResponse(history);
    
    res.json({ response: aiResponseText });
  } catch (error) {
    console.error('API /api/chat error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing text payload' });
    }

    const { audioBase64, mimeType } = await generateSpeech(text);
    
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    res.setHeader('Content-Type', mimeType);
    res.send(audioBuffer);
  } catch (error) {
    console.error('API /api/tts error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
