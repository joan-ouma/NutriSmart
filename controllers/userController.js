const User = require('../models/User');

exports.updateUserProfile = async (req, res) => {
    try {
        // Extract all profile fields from the request
        const { username, email, profileImage, goals, budgetLevel, bio, pantry } = req.body;

        // Determine how to find the user (by email if present, otherwise username)
        const filter = email ? { email } : { username };

        const user = await User.findOneAndUpdate(
            filter,
            { $set: { profileImage, goals, budgetLevel, bio, pantry } },
            { new: true } // Return the updated document
        );

        if (!user) return res.status(404).json({ success: false, msg: "User not found" });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.saveSearchHistory = async (req, res) => {
    try {
        const { username, query } = req.body;
        if(username && query) {
            await User.updateOne({ username }, { $push: { searchHistory: { query } } });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};