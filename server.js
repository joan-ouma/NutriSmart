const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// --- Import Route Files ---
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Logging Middleware ---
app.use((req, res, next) => {
    // Skip socket.io logs
    if (req.originalUrl.includes('socket.io')) return next();

    console.log(`\n--- Incoming Request: [${req.method}] ${req.originalUrl} ---`);
    if (req.body && Object.keys(req.body).length > 0) {
        try { console.log('Body Preview:', JSON.stringify(req.body).substring(0, 100)); } catch(e) {}
    }
    next();
});

// --- Database Connection ---
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nutrismart');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB Error: ${err.message}`);
    }
};

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', recipeRoutes);

// --- Health Check ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// --- Helper: Print all registered routes (Fixed to prevent crash) ---
function printRoutes() {
    console.log("\n🔎 REGISTERED ROUTES:");

    // SAFETY CHECK: If app._router is undefined, skip printing to avoid crash
    if (!app._router || !app._router.stack) {
        console.log("   (Routes not visible in app._router property - Skipping print)");
        console.log("----------------------\n");
        return;
    }

    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // routes registered directly on the app
            console.log(`   ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') { // router middleware
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    const baseUrl = middleware.regexp.toString().replace(/^\/\^/, '').replace(/\\\/\?\(\?\=\\\/\|\$\)\/i/, '').replace(/\\/g, '');
                    console.log(`   ${Object.keys(handler.route.methods).join(', ').toUpperCase()} /${baseUrl}${handler.route.path}`);
                }
            });
        }
    });
    console.log("----------------------\n");
}

// --- Start Server ---
if (process.env.NODE_ENV !== 'test') {
    connectDB();
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`👉 API Key Present: ${process.env.GEMINI_API_KEY ? 'YES' : 'NO'}`);
        // Call the safe version of printRoutes
        try {
            printRoutes();
        } catch (e) {
            console.log("Could not print routes (minor issue), but server is running.");
        }
    });
}

module.exports = app;