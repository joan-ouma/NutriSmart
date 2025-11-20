const express = require('express');
const router = express.Router();
const {
    generateRecipes,
    getTrendingRecipes,
    searchFood
} = require('../controllers/recipeController');

// Log when this file is loaded to confirm server sees it
console.log("-> 📂 recipeRoutes.js loaded");

// Define Routes
// 1. AI Recipe Generator -> POST /api/recommend
router.post('/recommend', generateRecipes);

// 2. Get Trending Recipes -> GET /api/recipes/trending
router.get('/recipes/trending', getTrendingRecipes);

// 3. Search Food -> POST /api/search
router.post('/search', searchFood);

module.exports = router;