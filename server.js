// server.js - Final Deployment Code

// 1. Setup - Minimal Cloud-Ready Code
require('dotenv').config(); 
const express = require('express'); 
const app = express(); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 3000; 

// 2. Frontend Configuration (EJS)
app.set('view engine', 'ejs');
app.set('views', './views'); 

// 3. AI Service Connection & Database Initialization (CLOUD-FIRST CHECK)
const { generatePersona } = require('./geminiService');
const admin = require('firebase-admin');

let db; // Global variable for Firestore

// Check 1: Try to connect using the secure environment variable (Render/Cloud)
// This is the preferred method for production deployment.
if (process.env.FIREBASE_CREDENTIALS_JSON) {
    try {
        // Parse the JSON string from the environment variable
        const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
        admin.initializeApp({
            credential: admin.credential.cert(credentials),
        });
        db = admin.firestore();
        console.log("SUCCESS: Firebase initialized using CLOUD ENVIRONMENT VARIABLE.");
    } catch (error) {
        console.error("ERROR: Failed to parse or use FIREBASE_CREDENTIALS_JSON. Database is DISABLED.", error.message);
        db = null;
    }
} 

// Check 2: If the cloud variable failed, try the local file (Pi/Development)
if (!db) {
    try {
        const serviceAccount = require('./serviceAccount.json'); 
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        db = admin.firestore();
        console.log("SUCCESS: Firebase initialized using LOCAL serviceAccount.json.");
    } catch (error) {
        console.error("WARNING: Local serviceAccount.json file not found or failed to load. Database remains DISABLED.");
        db = null;
    }
}

// 4. Routes

app.get('/', (req, res) => {
    res.render('index', { message: 'Phase 1: Integrity Protocol Core is Ready.' });
});

// Route to handle form submission (POST) - Validates Gates and Calls AI
app.post('/generate', async (req, res) => {
    const rawAnswers = req.body; 

    // CRITICAL GATE CHECK: Ensure ALL mandatory checkboxes are checked
    if (!rawAnswers.b17_consent || !rawAnswers.b7_liveness || !rawAnswers.b19a_gate) {
        return res.status(400).send("ERROR: Consent or Mandatory Liveness Check failed. All mandatory gates must be explicitly opted-in.");
    }

    try {
        // 1. Perform Persona Synthesis using the cloud AI (Gemini)
        const persona = await generatePersona(rawAnswers);

        let docRefId = "Database Disabled";
        let personaStatus = 'PHASE_1_COMPLETE';

        // 2. Save Persona to Firestore Database (CHECK IF DB IS INITIALIZED)
        if (db) {
            const personaRef = db.collection('personas');

            // Construct the full data object for saving
            const newPersonaData = {
                // Metadata
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                status: personaStatus,

                // Phase 1 User Inputs
                user_inputs: {
                    gender_identity: rawAnswers.gender_identity,
                    sexual_orientation: rawAnswers.sexual_orientation,
                    validated_age: parseInt(rawAnswers.validated_age),
                    B14_scar: rawAnswers.B14,
                    B16_foundation: rawAnswers.B16,
                    B15_seams_key: rawAnswers.B15,
                    B21_A_needs_vs_peace: parseFloat(rawAnswers.B21_A),
                    B21_B_common_vs_avoid: parseFloat(rawAnswers.B21_B),
                    // Consent Flags
                    b17_consent_conflict: !!rawAnswers.b17_consent,
                    b19b_consent_intimacy: !!rawAnswers.b19b_gate // OPTIONAL
                },

                // Phase 2 AI Outputs (Conflict Mapping Protocol)
                ai_analysis: {
                    persona_analysis: persona.persona_analysis,
                    B15_seams_mechanism: persona.B15_seams_mechanism,
                    B21_tki_score: persona.B21_tki_score,
                    structural_principle: persona.structural_principle,
                    // Conflict Mapping Outputs
                    scar_demand_requirement: persona.scar_demand_requirement,
                    red_button_requirement: persona.red_button_requirement,
                    blast_radius_archetype: persona.blast_radius_archetype
                }
            };

            const docRef = await personaRef.add(newPersonaData);
            docRefId = docRef.id;
        }

        // 3. Success Message
        const summary = `
        Persona Saved (ID: ${docRefId})!
        - **Blast Radius:** ${persona.blast_radius_archetype}
        - **Red Button:** ${persona.red_button_requirement}
        - Seams: ${persona.B15_seams_mechanism}
        - TKI Score: ${persona.B21_tki_score}
        `;

        // Send back a success message with the new Phase 2 data points
        res.send(`SUCCESS! Persona Synthesis and Database Storage Complete. ${summary}`);

    } catch (error) {
        console.error("--- CRITICAL RUNTIME ERROR ---");
        console.error(error);
        // This error handler is now robust for both AI failure and Database save failure
        res.status(500).send(`CRITICAL ERROR: Synthesis or Database Storage Failed. Message: ${error.message}`);
    }
});

// 5. Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}. Checking database status...`);
});
