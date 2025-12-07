// 1. Setup - Minimal Cloud-Ready Code
require('dotenv').config(); // Load environment variables from .env
const express = require('express'); 
const app = express(); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 3000; 

// 2. Frontend Configuration (EJS)
app.set('view engine', 'ejs');
app.set('views', './views'); 

// 3. AI Service Connection
const { generatePersona } = require('./geminiService'); // NEW: Import the cloud AI function

// 4. Routes

// Route to show the Phase 1 Questionnaire
app.get('/', (req, res) => {
    res.render('index', { message: 'Phase 1: Integrity Protocol Core is Ready. AI OFFLINE.' });
});

// Route to handle form submission (POST) - Calls the Gemini AI
app.post('/generate', async (req, res) => {
    const rawAnswers = req.body; 

    try {
        // 1. Perform Persona Synthesis using the cloud AI (Gemini)
        const persona = await generatePersona(rawAnswers);

        // 2. SIMULATED Success (Since Firebase is offline)
        const summary = `
        Persona Generated!
        - Analysis: ${persona.persona_analysis}
        - Seams: ${persona.B15_seams_mechanism}
        - TKI Score: ${persona.B21_tki_score}
        - Principle: ${persona.structural_principle}
        `;

        // This is the success message sent back to the browser
        res.send(`SUCCESS! Persona Synthesis Complete (AI Stable). ${summary}`);

    } catch (error) {
        console.error(error);
        res.status(500).send(`ERROR: Synthesis Failed. Check terminal for Gemini API key status. Message: ${error.message}`);
    }
});

// 5. Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

