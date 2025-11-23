const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Nia backend (OpenAI) is running' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, system } = req.body;

        const openaiMessages = [
            { role: 'system', content: system },
            ...messages
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: openaiMessages,
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI error:', error);
            return res.status(response.status).json({ 
                error: 'API call failed',
                details: error 
            });
        }

        const data = await response.json();
        
        const formattedResponse = {
            content: [{
                type: 'text',
                text: data.choices[0].message.content
            }]
        };

        res.json(formattedResponse);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            error: 'Server error', 
            message: error.message 
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Nia backend running on port ${PORT}`);
});
