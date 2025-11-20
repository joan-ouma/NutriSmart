const Recipe = require('../models/Recipe');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Log on file load to confirm this file is being used
console.log("-> 📂 recipeController.js loaded successfully");

// --- 1. AI Recipe Generator ---
exports.generateRecipes = async (req, res) => {
    console.log("\n-> 🏁 START: generateRecipes Controller");

    const { pantry, userGoal, budget } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // 1. Validate Input
    if (!pantry) {
        console.log("-> ❌ Error: No pantry items provided");
        return res.status(400).json({ success: false, error: "Ingredients required" });
    }

    // 2. Validate API Key
    if (!apiKey || apiKey.length < 10) {
        console.error("-> ⚠️ WARNING: GEMINI_API_KEY is missing or invalid in .env file.");
        console.log("-> 🔄 Switching to FALLBACK MODE (Mock Data) so app doesn't crash.");
        return res.json({ success: true, data: getFallbackRecipes(pantry) });
    }

    try {
        console.log("-> 🤖 Initializing Gemini AI...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

        const prompt = `
      Act as a nutritionist.
      Context: Pantry: ${pantry}, Goal: ${userGoal}, Budget: ${budget}.
      Task: Generate 2 distinct recipes.
      Output: Valid JSON array only. NO markdown.
      Schema: [{ "name": "string", "time": "30m", "costPerServing": "$3", "nutrition": {"calories": 500, "protein": "30g", "carbs": "40g", "fats": "15g"}, "missingIngredients": ["string"], "instructions": ["string"], "whyItWorks": "string" }]
    `;

        console.log("-> 📡 Sending request to Google AI...");
        // Timeout Promise to prevent infinite hanging
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("AI Timeout")), 15000));

        const result = await Promise.race([
            model.generateContent(prompt),
            timeout
        ]);

        const responseText = result.response.text();
        console.log("-> 📥 AI Response received.");

        // Clean and Parse
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        let recipes;

        try {
            recipes = JSON.parse(cleanText);
        } catch (e) {
            console.error("-> ❌ JSON Parse Failed:", cleanText);
            // Fallback if AI returns bad JSON
            return res.json({ success: true, data: getFallbackRecipes(pantry) });
        }

        // Save to DB asynchronously
        recipes.forEach(async (r) => {
            try { await Recipe.create({ ...r, aiGenerated: true }); } catch(e) {}
        });

        console.log("-> ✅ Success! Sending recipes to client.");
        res.json({ success: true, data: recipes });

    } catch (error) {
        console.error("-> ❌ AI GENERATION FAILED:", error.message);
        // CRITICAL: Even if AI fails, send backup recipes so user sees SOMETHING
        console.log("-> 🔄 Sending FALLBACK recipes due to error.");
        res.json({ success: true, data: getFallbackRecipes(pantry) });
    }
};

// --- 2. Trending Recipes ---
exports.getTrendingRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(4);
        res.json({ success: true, data: recipes });
    } catch (err) {
        res.status(500).json({ success: false, error: "Fetch failed" });
    }
};

// --- 3. Search Food ---
exports.searchFood = async (req, res) => {
    const { query } = req.body;
    if(!process.env.GEMINI_API_KEY) {
        return res.json([{ name: query, calories: 100, benefits: "No API Key - Mock Data", category: "Mock" }]);
    }
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
        const prompt = `Search food: "${query}". Return JSON array: [{"name": "string", "calories": number, "benefits": "string", "category": "string"}]`;
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (err) {
        res.json([{ name: query, calories: 0, benefits: "Search Failed", category: "Error" }]);
    }
};

// --- Helper: Backup Recipes (Used when AI fails) ---
function getFallbackRecipes(ingredients) {
    return [
        {
            name: `Simple ${ingredients.split(' ')[0]} Stir Fry`,
            time: "15m",
            costPerServing: "$2.50",
            nutrition: { calories: 450, protein: "25g", carbs: "40g", fats: "15g" },
            missingIngredients: ["Soy Sauce", "Garlic"],
            instructions: ["Chop ingredients", "Sauté in pan", "Serve hot"],
            whyItWorks: "A quick, balanced meal using your available ingredients (Backup Recipe)."
        },
        {
            name: "Quick Comfort Bowl",
            time: "10m",
            costPerServing: "$1.50",
            nutrition: { calories: 300, protein: "10g", carbs: "50g", fats: "5g" },
            missingIngredients: ["Salt", "Pepper"],
            instructions: ["Mix ingredients in a bowl", "Season to taste", "Enjoy"],
            whyItWorks: "Easy preparation for a busy day (Backup Recipe)."
        }
    ];
}