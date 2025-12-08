// cbtService.js - Cognitive Break Theory (CBT) Matching Engine

/**
 * Defines the three types of Cognitive Break based on structural conflict.
 * This logic determines the core incompatibility of two user Personas.
 */
const COGNITIVE_BREAK_TYPES = {
    MIS_DIRECTION: {
        name: "Mis-Direction",
        cause: "A fundamental conflict in **priorities or direction** (B21 TKI Scores are diametrically opposed, or one user is Compliance-driven and the other is Integrity-driven).",
        remedy: "Requires strict boundary setting and clear, future-oriented goal alignment (Vulnerability Cycle Directive).",
        pattern: (user1, user2) => {
            // Check for a large mismatch in TKI scores (B21_A and B21_B)
            // If one prioritizes needs (low A) and the other prioritizes peace (high A)
            const tkiA_diff = Math.abs(user1.user_inputs.B21_A_needs_vs_peace - user2.user_inputs.B21_A_needs_vs_peace);
            // If one seeks common ground (low B) and the other avoids (high B)
            const tkiB_diff = Math.abs(user1.user_inputs.B21_B_common_vs_avoid - user2.user_inputs.B21_B_common_vs_avoid);

            // Define a high conflict threshold (e.g., difference > 3 on a 5-point scale)
            return tkiA_diff > 3.5 || tkiB_diff > 3.5;
        }
    },
    MIS_ATTACHMENT: {
        name: "Mis-Attachment",
        cause: "A structural conflict in **relational security and trust** (B16 Foundations are incompatible, or a Scar [B14] directly threatens the other's Foundation).",
        remedy: "Requires radical honesty and slow, deliberate trust-building; The Scar must be healed before the Foundation can hold.",
        pattern: (user1, user2) => {
            // If User 1's Scar directly violates User 2's Foundation, and vice versa.
            // This will be modeled by the AI in the final output, but we use a placeholder here.
            // Placeholder: If both users score high on the Avoidance TKI scale (B21_B > 4)
            const u1_avoid = user1.user_inputs.B21_B_common_vs_avoid > 4;
            const u2_avoid = user2.user_inputs.B21_B_common_vs_avoid > 4;

            // Two avoidant people will create a Mis-Attachment where neither builds a foundation.
            return u1_avoid && u2_avoid;
        }
    },
    MIS_ATTRIBUTION: {
        name: "Mis-Attribution",
        cause: "A failure to correctly **read the other person's Seams (B15)**, mistaking their coping mechanism for a deliberate attack.",
        remedy: "Requires active emotional translation (The Mis-Match Tape) and agreement on the vulnerability cycle directive.",
        pattern: (user1, user2) => {
            // If one user has an aggressive Seam (B15) and the other has a freezing/fleeing Seam.
            // This is a direct volatility mismatch.
            const aggressive_seam_keywords = ['anger', 'attack', 'yell', 'lashing out', 'erupt'];
            const passive_seam_keywords = ['withdrawal', 'shut down', 'freeze', 'flee', 'silent treatment'];

            // Check if User 1's seam description contains an aggressive word
            const u1_aggressive = aggressive_seam_keywords.some(word => user1.user_inputs.B15_seams_key.toLowerCase().includes(word));
            // Check if User 2's seam description contains a passive word
            const u2_passive = passive_seam_keywords.some(word => user2.user_inputs.B15_seams_key.toLowerCase().includes(word));

            // A Mis-Attribution occurs when Aggression meets Freezing, leading to misunderstanding.
            return (u1_aggressive && u2_passive) || (!u1_aggressive && !u2_passive);
        }
    }
};

/**
 * Simulates the matching process between two existing Personas.
 * @param {object} user1 - The data structure for the first user.
 * @param {object} user2 - The data structure for the second user.
 * @returns {string} The identified Cognitive Break Type.
 */
const identifyCognitiveBreak = (user1, user2) => {
    // The final algorithm would run all patterns and use the AI for validation.
    // For the prototype, we simply return the first successful pattern.

    for (const key in COGNITIVE_BREAK_TYPES) {
        const breakType = COGNITIVE_BREAK_TYPES[key];
        if (breakType.pattern(user1, user2)) {
            return breakType.name;
        }
    }

    // Default if no severe structural conflict is immediately identified
    return "Structural Alignment";
};

module.exports = {
    COGNITIVE_BREAK_TYPES,
    identifyCognitiveBreak
};
