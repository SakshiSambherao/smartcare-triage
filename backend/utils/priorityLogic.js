/**
 * SmartCare Clinical Triage Prioritization Engine
 * Evaluates patient descriptions AND biological vitals to compute priority scores.
 *
 * @param {string} diseaseDescription - The raw symptom text typed by the user
 * @param {object} vitals - Physiological metrics { spo2, heartRate, bloodPressure }
 * @returns {number} Acuity Score from 1 to 10 (Default: 3)
 */
function calculatePriority(diseaseDescription, vitals) {
    // 1. Safety Guard: If input is missing, empty, or invalid, assign a safe fallback score
    if (!diseaseDescription || typeof diseaseDescription !== 'string') {
        return 3;
    }

    // 2. Normalize input: Convert to lowercase and trim whitespace to wipe out case-sensitivity issues
    const input = diseaseDescription.toLowerCase().trim();

    // Track the highest acuity match found in the text string
    let highestScoreDetected = 1;
    let matchFound = false;

    // 3. Clinical Dictionary Matrix (Keywords grouped by emergency tier levels)
    const triageDictionary = [
        {
            score: 10,
            keywords: ['chest pain', 'heart', 'cardiac', 'stroke', 'paralysis', 'unconscious', 'attack', 'mi', 'seizure', 'fits']
        },
        {
            score: 9,
            keywords: ['breathing', 'asthma', 'suffocating', 'choking', 'oxygen', 'lungs', 'breath', 'shortness of breath']
        },
        {
            score: 8,
            keywords: ['bleed', 'blood', 'hemorrhage', 'accident', 'cut', 'wound', 'stab', 'injury', 'trauma', 'gushing']
        },
        {
            score: 7,
            keywords: ['high fever', 'chills', 'shivering', 'uncontrolled fever', 'burning body', 'infection']
        },
        {
            score: 6,
            keywords: ['fracture', 'broken', 'bone', 'dislocation', 'cracked', 'skull', 'joint split']
        },
        {
            score: 5,
            keywords: ['stomach', 'abdominal', 'vomit', 'appendix', 'nausea', 'diarrhea', 'food poisoning', 'cramp']
        },
        {
            score: 4,
            keywords: ['headache', 'migraine', 'dizzy', 'dizziness', 'vertigo']
        },
        {
            score: 2, // Low urgency layer
            keywords: ['cold', 'cough', 'flu', 'sore throat', 'sneezing', 'runny nose', 'fever', 'rash', 'itch', 'allergy']
        }
    ];

    // 4. SCAN PIPELINE: Evaluate sentence structure against our dictionary blocks
    for (const tier of triageDictionary) {
        for (const keyword of tier.keywords) {
            if (input.includes(keyword)) {
                matchFound = true;
                // If a keyword hits, keep track of it if it's the highest urgency score found so far
                if (tier.score > highestScoreDetected) {
                    highestScoreDetected = tier.score;
                }
            }
        }
    }

    // 5. INTUITIVE FALLBACK MECHANISM
    // If no exact match is found, but the text contains phrases like "severe", "critical", or "emergency", push priority up!
    if (input.includes('severe') || input.includes('acute') || input.includes('critical') || input.includes('emergency') || input.includes('intense')) {
        highestScoreDetected = Math.max(highestScoreDetected, 6);
        matchFound = true;
    }

    // Determine baseline priority calculated from text string matching
    let baselineTextScore = matchFound ? highestScoreDetected : 3;

    // --- 6. FEATURE 1: CRITICAL PHYSIOLOGICAL OVERRIDE LOGIC ---
    if (vitals) {
        // A. Oxygen Deprivation Check (SpO2 below 92% is an immediate clinical emergency)
        if (vitals.spo2 && vitals.spo2 < 92) {
            console.log(`⚠️ TRIAGE CRITICAL OVERRIDE: Patient SpO2 is dangerously low (${vitals.spo2}%). Escalating case to Level 9.`);
            baselineTextScore = Math.max(baselineTextScore, 9);
        }

        // B. Tachycardia / Cardiac Distress Check (Heart rate over 140 BPM or under 45 BPM indicates potential shock)
        if (vitals.heartRate && (vitals.heartRate > 140 || vitals.heartRate < 45)) {
            console.log(`⚠️ TRIAGE CRITICAL OVERRIDE: Unstable Heart Rate (${vitals.heartRate} BPM). Escalating case to Level 8.`);
            baselineTextScore = Math.max(baselineTextScore, 8);
        }
    }

    return baselineTextScore;
}

module.exports = calculatePriority;