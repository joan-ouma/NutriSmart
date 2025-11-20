const express = require('express');
const router = express.Router();
const { updateUserProfile, saveSearchHistory } = require('../controllers/userController');

// Paths become: /api/user/profile and /api/user/search-history
router.post('/profile', updateUserProfile);
router.post('/search-history', saveSearchHistory);

module.exports = router;