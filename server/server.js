import express from 'express';
import cors from 'cors';
import { generateChatResponse } from './gemini.js';

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
