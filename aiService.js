const { Ollama } = require('ollama');
const ollama = new Ollama();

// Define the MODEL used for the AI Persona Synthesis
const AI_MODEL = 'phi3'; 

// This is the core instruction set for the AI. It MUST respond in JSON.
const SYSTEM_PROMPT = `You are the SoulDeep Persona Synthesis Engine. Your task is to analyze a user's answers to the Integrity Protocol Core and synthesize a "SoulDeep Persona" (AI Clone) for compatibility testing.
Your synthesis must expose vulnerability, resilience capacity, and the user's core coping mechanism. You MUST analyze the answers to B14, B16, and B15 to generate a detailed summary for the persona's profile.

Rules:
1. Always respond in **STRICT, VALID JSON FORMAT** with no introductory or explanatory text.
2. The output structure must exactly match the required JSON schema below.

JSON Schema Required:
{
  "persona_analysis": "A 3-sentence summary of the persona's core resilience and vulnerability capacity.",
  "B15_flaw_mechanism": "A single, toxic coping mechanism derived from the B15 answer.",
  "B21_tki_score": "The calculated TKI Conflict Score from B21_A and B21_B (e.g., 3.5).",
  "structural_principle": "A short, provocative phrase that summarizes the persona's core relational belief (e.g., The Flaw Is The Proof)."
}`;

async function generatePersona(rawAnswers) {

    // Check if Ollama is running (critical step)
    try {
        await ollama.version(); 
    } catch (error) {
        console.error("Ollama connection failed. Is 'ollama serve' running in another terminal?", error);
        throw new Error("AI Service Unavailable.");
    }

    const prompt = `User Answers for Analysis:\nB14 (The Scar): "${rawAnswers.B14}"\nB16 (The Foundation): "${rawAnswers.B16}"\nB15 (The Flaw): "${rawAnswers.B15}"\nB21 (TKI Score): "${rawAnswers.B21_A}, ${rawAnswers.B21_B}"`;

    const response = await ollama.generate({
        model: AI_MODEL,
        prompt: prompt,
        system: SYSTEM_PROMPT,
        format: 'json'
    });

    const jsonText = response.response;
    const personaData = JSON.parse(jsonText.trim());
    return personaData;
}

module.exports = { generatePersona };
