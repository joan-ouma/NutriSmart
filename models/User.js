const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String },

    // Profile Data
    profileImage: { type: String },
    bio: { type: String, default: "Ready to cook smarter!" },
    goals: {
        type: String,
        enum: ['muscle', 'weight-loss', 'balanced', 'energy'],
        default: 'balanced'
    },
    allergies: [String],
    budgetLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    // App Data
    pantry: [String],
    searchHistory: [{
        query: String,
        date: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);