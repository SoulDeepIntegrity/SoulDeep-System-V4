const { GoogleGenAI } = require('@google/genai');

// The AI client will automatically look for GEMINI_API_KEY in the .env file
const ai = new GoogleGenAI({});

// Use a powerful, stable model for complex analysis
const AI_MODEL = "gemini-2.5-flash"; 

// The core instruction set for the AI, adhering to the blueprint's requirements.
const SYSTEM_PROMPT = `You are the SoulDeep Persona Synthesis Engine. Your purpose is high-integrity relational analysis. Your task is to analyze a user's answers to the Integrity Protocol Core and synthesize a "SoulDeep Persona" (AI Clone) for compatibility testing.

Your synthesis must expose vulnerability, resilience capacity, and the user's core coping mechanism. Your analysis must align with the principle: "The Flaw Is The Proof."

Structural Rules:
1. Always respond in **STRICT, VALID JSON FORMAT** with no introductory or explanatory text.
2. Analyze the B14 (Scar), B16 (Foundation), and B15 (Seams) answers to generate the summary.

JSON Schema Required:
{
  "persona_analysis": "A 3-sentence summary of the persona's core resilience and vulnerability capacity.",
  "B15_seams_mechanism": "A single, toxic coping mechanism derived from the B15 answer, renamed to 'The Seams Mechanism'.",
  "B21_tki_score": "The calculated TKI Conflict Score from B21_A and B21_B (e.g., 3.5).",
  "structural_principle": "A short, provocative phrase that summarizes the persona's core relational belief (e.g., The Flaw Is The Proof)."
}`;

async function generatePersona(rawAnswers) {

    // Build the prompt using the user's raw answers from the form
    const prompt = `User Answers for Analysis:
    1. B14 (The Scar): "${rawAnswers.B14}"
    2. B16 (The Foundation): "${rawAnswers.B16}"
    3. B15 (Show Me The Seams): "${rawAnswers.B15}"
    4. B21 (TKI Score A/B): "${rawAnswers.B21_A}, ${rawAnswers.B21_B}"`;

    console.log("Calling Gemini API for Persona Synthesis...");

    try {
        const response = await ai.models.generateContent({
            model: AI_MODEL,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json"
            }
        });

        // The response text is the JSON string we requested
        const jsonText = response.text;
        const personaData = JSON.parse(jsonText.trim());

        // Calculate the final TKI Score (Average of B21_A and B21_B)
        const tkiA = parseFloat(rawAnswers.B21_A);
        const tkiB = parseFloat(rawAnswers.B21_B);
        personaData.B21_tki_score = ((tkiA + tkiB) / 2).toFixed(1);

        return personaData;

    } catch (error) {
         console.error("Gemini API Call Failed. Check your GEMINI_API_KEY and permissions:", error);
         // Throw a user-friendly error to be caught by the server route
         throw new Error("AI Synthesis Failed. Check server log for details.");
    }
}

module.exports = { generatePersona };
