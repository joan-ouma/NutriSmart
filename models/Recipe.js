const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ingredients: [String],
    nutrition: {
        calories: Number,
        protein: String,
        carbs: String,
        fats: String
    },
    instructions: [String],
    costPerServing: String,
    time: String,
    missingIngredients: [String], // Useful for the AI response
    whyItWorks: String,           // AI rationale

    // Metadata
    image: { type: String }, // URL for food image
    aiGenerated: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);