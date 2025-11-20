const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://nutrismart-frontend.vercel.app", // Check if this matches your Vercel URL exactly
        "https://mern-final-project-joan-ouma.vercel.app"
    ],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', recipeRoutes);

// --- Health Check (Crucial for Render) ---
app.get('/health', (req, res) => {
    res.status(200).send("OK");
});

app.get('/', (req, res) => {
    res.send("NutriSmart Backend is Running");
});

// --- Database & Start ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrismart');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        // Do not exit process here, keeps the container alive so you can see logs
    }
};

// Start Server
app.listen(PORT, () => {
    connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
});