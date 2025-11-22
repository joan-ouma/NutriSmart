const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- CORS Setup ---
const rawOrigins = process.env.CORS_ORIGIN || '';
const envOrigins = rawOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const defaultOrigins = [
    'http://localhost:3000',
    'https://nutrismart-frontend.vercel.app',
    'https://mern-final-project-joan-ouma.vercel.app'
];

const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

// --- Body Parsing Middleware ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Simple Request Logger ---
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

// --- Health Check ---
app.get('/health', (req, res) => res.status(200).send("OK"));

app.get('/', (req, res) => res.send("NutriSmart Backend is Running"));

// --- Database Connection ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrismart', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        // Process not exited to keep container running for logs
    }
};

// --- Start Server & Connect DB ---
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    connectDB();
});
