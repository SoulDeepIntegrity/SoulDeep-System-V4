// geminiService.js - Final Code with Cognitive Break Theory (CBT) Logic

const { GoogleGenAI } = require('@google/genai');

// Initialize the AI client using the API key from the environment variable
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
const model = 'gemini-2.5-flash';

// --- Cognitive Break Theory (CBT) Rule Engine ---
/* This is the internal, non-AI logic that determines the fundamental conflict type 
between two personae, based on their core vulnerabilities (Scar and Foundation).
This function would be used in a future route to match two saved personae.

Archetypes:
1. Mis-Direction: Conflict arises from fundamental dishonesty/avoidance. (Scar vs Scar)
2. Mis-Attachment: Conflict arises from incompatible needs/expectations. (Foundation vs Foundation)
3. Mis-Attribution: Conflict arises from confusing a partner's coping mechanism for an attack. (Seams vs Seams)
*/

function getBreakArchetype(persona1, persona2) {
    // NOTE: For this final demonstration, we will simplify the CBT logic.
    // In a live system, this would involve complex semantic comparison of B14/B16/B15 strings.

    const data1 = persona1.user_inputs;
    const data2 = persona2.user_inputs;

    // Rule 1: High Scar vs. High Scar (Potential for Mis-Direction)
    // If both users have deep-seated, painful secrets (long B14 answers), they are prone to Mis-Direction.
    if (data1.B14_scar.length > 100 && data2.B14_scar.length > 100) {
        return {
            archetype: 'Mis-Direction (Honesty/Secrecy)',
            description: 'Both personae carry deep, unaddressed relational scars (B14). The conflict will manifest as an inability to trust the honesty of the other, leading to fundamental directional misalignment.',
        };
    }

    // Rule 2: Incompatible Foundations (Potential for Mis-Attachment)
    // If one user needs high emotional security (B16) and the other is highly conflict-avoidant (B21 score), they are prone to Mis-Attachment.
    // We use B21_A > 4.0 as a proxy for high conflict avoidance.
    if (data1.B21_A_needs_vs_peace > 4.0 || data2.B21_A_needs_vs_peace > 4.0) {
        if (data1.B16_foundation.length < 50 && data2.B16_foundation.length < 50) {
             return {
                archetype: 'Mis-Attachment (Incompatible Needs)',
                description: 'One or both personae prioritize peace over needs (B21-A), creating a structural dependency that will inevitably lead to one user feeling their safety foundation (B16) is unmet, leading to a break.',
            };
        }
    }

    // Default Rule: Mis-Attribution
    // If the conflict is not fundamentally about honesty or core safety needs, it will likely be a misunderstanding of coping mechanisms (B15).
    return {
        archetype: 'Mis-Attribution (Coping Mechanism Misunderstanding)',
        description: 'The core conflict will not be about truth or safety, but about confusing the partner\'s go-to coping mechanism (B15 Seams) as a personal attack, leading to a reactive misunderstanding.',
    };
}


// --- AI Persona Synthesis Function ---
async function generatePersona(answers) {
    const prompt = `
        You are the "SoulDeep Integrity Protocol" AI, specializing in Conflict Mapping Theory.
        Your task is to analyze the user's relational vulnerabilities and predict their conflict archetype.

        Use the following data provided by the user (B-Tags) to generate a detailed persona:
        1. B14 (The Scar): ${answers.B14} (One time honesty caused loss)
        2. B16 (The Foundation): ${answers.B16} (One non-negotiable feeling needed for safety)
        3. B15 (The Seams): ${answers.B15} (Go-to toxic coping mechanism)
        4. B21 (TKI Score Proxies): Needs vs Peace = ${answers.B21_A}, Common vs Avoid = ${answers.B21_B}

        **Instructions for Output Generation (Phase 2: Conflict Mapping Protocol):**
        * **Blast Radius Archetype:** Based on the data (especially B15 and B21 scores), determine the user's conflict archetype. Must be one word: **Erupt, Freeze, Flee, or Panic.**
        * **Red Button Requirement:** Identify the specific trigger phrase/action that instantly activates the defense (based on B16).
        * **Seams Mechanism (B15):** Rephrase the B15 coping mechanism into a simple, single-word defense strategy (e.g., Lashing Out, Withdrawal, Fawning, Controlling).
        * **TKI Score (B21):** Calculate the average of B21_A and B21_B, rounded to the nearest whole number (1-5).
        * **Structural Principle:** Create a one-sentence, powerful philosophical statement summarizing their conflict core.

        **Output ONLY in the exact JSON format requested below. Do not include any external commentary.**

        {
            "persona_analysis": "A detailed psychological analysis (3-5 sentences) combining B14 and B16.",
            "B15_seams_mechanism": "[Single word defense strategy from B15]",
            "B21_tki_score": [Calculated TKI Score (1-5)],
            "structural_principle": "[One-sentence philosophical summary]",
            "scar_demand_requirement": "The deep-seated need derived from B14 (e.g., Demands radical acceptance, requires absolute transparency).",
            "red_button_requirement": "The specific trigger phrase/action that instantly activates the defense (from B16).",
            "blast_radius_archetype": "[Blast Radius Archetype: Erupt, Freeze, Flee, or Panic]"
        }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        // The response text is a JSON string
        const persona = JSON.parse(response.text);

        return persona;

    } catch (error) {
        console.error("AI Synthesis Failed:", error);
        // Re-throw a custom error to be caught by the server's post handler
        throw new Error(`AI Synthesis Failed. Check server log for details. Message: ${error.message}`);
    }
}

module.exports = { 
    generatePersona,
    getBreakArchetype // Export the new CBT function
};
