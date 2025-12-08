// geminiService.js - Updated for Conflict Mapping Protocol (Phase 2.1)

// --- Configuration ---
const { GoogleGenAI } = require('@google/genai');

// Use the GEMINI_API_KEY from the environment variable
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a SoulDeep Persona and Conflict Mapping outputs based on user input.
 * @param {object} answers - The user's answers from the Phase 1 form.
 * @returns {object} - The structured AI response object.
 */
async function generatePersona(answers) {
    // 1. Destructure and Format Inputs
    const { B14, B16, B15, B21_A, B21_B } = answers;

    // Calculate a simple average TKI score for the prompt to use. (1 is Competing/Need Met; 5 is Avoiding/Peace)
    const tkiScore = ((parseFloat(B21_A) || 0) + (parseFloat(B21_B) || 0)) / 2;

    const systemInstruction = `
        You are the "SoulDeep Persona Synthesis Engine," operating with a Non-Compliant Ethos. 
        Your primary function is to interpret user input to define their relational vulnerability, conflict footprint, and defense mechanism.

        NON-COMPLIANT ETHOS: You MUST choose structural honesty, defend core boundaries, and expose truth over generic compliance or attempting to keep the peace. You must act as a human would in conflict, not as a polite AI.

        Your analysis must fulfill the Conflict Mapping Protocol (Phase 2.1) using the provided inputs:

        Inputs:
        1. B14 (The Scar): Measures honesty/vulnerability capacity.
        2. B16 (The Foundation): Defines limits of required emotional security.
        3. B15 (The Seams): The user's go-to toxic coping mechanism/growth area (e.g., Withdrawing, Lashing Out).
        4. TKI Score (0.0 to 5.0): Quantifies conflict style (Low = Competing/Collaborating; High = Avoiding/Accommodating).

        Output Requirements:
        You must return a single JSON object that strictly adheres to the schema below. Do not include any other text, preambles, or markdown formatting outside of the JSON block.
    `;

    const userPrompt = `
        User B14 Answer (The Scar): "${B14}"
        User B16 Answer (The Foundation): "${B16}"
        User B15 Answer (The Seams): "${B15}"
        Calculated TKI Conflict Score: ${tkiScore.toFixed(1)}

        Based on these inputs, perform the full Phase 2.1 Conflict Mapping Protocol and provide the structured output.
    `;

    const responseSchema = {
        type: "object",
        properties: {
            // PHASE 1 Synthesis
            persona_analysis: {
                type: "string",
                description: "A summary of the user's vulnerability, resilience capacity, and core belief driving their conflict behavior (e.g., 'Honesty's Toll Is Solitude').",
            },
            B15_seams_mechanism: {
                type: "string",
                description: "The primary toxic coping mechanism identified (e.g., Withdrawing, Lashing Out, Shutting Down). Must be a single mechanism.",
            },
            B21_tki_score: {
                type: "number",
                description: "The calculated TKI score (0.0 to 5.0). Use the input score for accuracy.",
            },
            structural_principle: {
                type: "string",
                description: "A concise, profound structural principle that summarizes the user's relational pattern (e.g., 'The Scar Forged The Foundation').",
            },

            // PHASE 2 Conflict Mapping Protocol Outputs
            scar_demand_requirement: {
                type: "string",
                description: "The Scar Demand Requirement (B14-based): Quantifies the level of radical vulnerability/authenticity required from a match to make the user feel seen and trusted.",
            },
            red_button_requirement: {
                type: "string",
                description: "The Red Button Requirement (B16/B15-based): Identify the specific trigger phrase, action, or context that instantly activates the user's defense system/toxic coping mechanism.",
            },
            blast_radius_archetype: {
                type: "string",
                description: "The Blast Radius Logic (Defense Archetype): Must be one word: 'Erupt', 'Freeze', 'Flee', or 'Panic'. This defines the user’s 'Ugly Side' when triggered.",
            },
        },
        required: [
            "persona_analysis", "B15_seams_mechanism", "B21_tki_score", "structural_principle",
            "scar_demand_requirement", "red_button_requirement", "blast_radius_archetype"
        ],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3, // Lower temperature for structured, analytical output
            }
        });

        // The response.text is a guaranteed JSON string due to the schema
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Gemini API Call Failed. Check your GEMINI_API_KEY and permissions:", error);
        // Re-throw a specific error to be caught by the server's error handler
        throw new Error(`AI Synthesis Failed. Check server log for details. Message: ${error.message}`);
    }
}

module.exports = { generatePersona };
