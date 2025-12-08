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

// 3. AI Service Connection & Database Initialization (FILE-BASED METHOD)
const { generatePersona } = require('./geminiService');
const admin = require('firebase-admin');

let db; // Global variable for Firestore

// Use a serviceAccount.json file for local testing
try {
    // Node.js will load the JSON file directly and strictly check its format
    const serviceAccount = require('./serviceAccount.json'); 

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("SUCCESS: Firebase initialized successfully using local serviceAccount.json.");
} catch (error) {
    // CRITICAL: Log the exact error message
    console.error("\n--- CRITICAL FIREBASE CONFIGURATION ERROR ---");
    console.error("The database connection failed. Most likely: Malformed/Missing JSON in serviceAccount.json.");
    console.error("EXACT NODE.JS ERROR:", error.message);
    console.error("---------------------------------------------\n");
    db = null; // Ensure db is null so we don't try to save later
}

// 4. Routes

app.get('/', (req, res) => {
    res.render('index', { message: 'Phase 1: Integrity Protocol Core is Ready.' });
});

// Route to handle form submission (POST) - Validates Gates and Calls AI
app.post('/generate', async (req, res) => {
    const rawAnswers = req.body; 

    // CRITICAL GATE 1: Two-Tier Consent (B19 A/B) & Liveness (B7)
    if (!rawAnswers.b17_consent || !rawAnswers.b7_liveness || !rawAnswers.b19a_gate || !rawAnswers.b19b_gate) {
        return res.status(400).send("ERROR: Consent or Mandatory Liveness Check failed. All gates must be explicitly opted-in.");
    }

    try {
        // 1. Perform Persona Synthesis using the cloud AI (Gemini)
        const persona = await generatePersona(rawAnswers);

        let docRefId = "Database Disabled";

        // 2. Save Persona to Firestore Database (CHECK IF DB IS INITIALIZED)
        if (db) {
            const personaRef = db.collection('personas');
            const newPersonaData = {
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                B14: rawAnswers.B14,
                B16: rawAnswers.B16,
                B15: rawAnswers.B15,
                B21_A: rawAnswers.B21_A,
                B21_B: rawAnswers.B21_B,
                ...persona, // Add all AI-generated fields (Seams, Analysis, TKI Score)
                status: 'PHASE_1_COMPLETE'
            };

            const docRef = await personaRef.add(newPersonaData);
            docRefId = docRef.id;
        }

        // 3. Success Message
        const summary = `
        Persona Saved (ID: ${docRefId})!
        - Analysis: ${persona.persona_analysis}
        - Seams: ${persona.B15_seams_mechanism}
        - TKI Score: ${persona.B21_tki_score}
        - Principle: ${persona.structural_principle}
        `;

        res.send(`SUCCESS! Persona Synthesis and Database Storage Complete. ${summary}`);

    } catch (error) {
        console.error(error);
        // This error handler is now more robust for AI or Database failures
        res.status(500).send(`CRITICAL ERROR: Synthesis or Database Storage Failed. Message: ${error.message}`);
    }
});

// 5. Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}. Checking database status...`);
});
