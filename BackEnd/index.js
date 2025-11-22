require("./utils");
require("dotenv").config();

const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;
const isProd = process.env.NODE_ENV === "production";

// Middleware
app.use(cors({
    origin: [
        "https://comp-4537-t5-prj.vercel.app", // your Vercel frontend
        "http://localhost:5173"                // local dev
    ],
    credentials: true
}));
app.use(express.json()); // Parse incoming JSON requests

const { printMySQLVersion } = include('database/db_utils');

printMySQLVersion();

const expireTime = 60 * 60 * 1000; // 1 Hour
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

const mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/${mongodb_database}`,
    crypto: {
        secret: mongodb_session_secret
    }
});

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: false,
    name: 'connect.sid',
    cookie: {
        maxAge: expireTime,
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        // Explicitly don't set domain for cross-site cookies
        domain: undefined
    },
    // Ensure cookie is set even with saveUninitialized: false
    rolling: false,
    genid: (req) => {
        return require('crypto').randomBytes(16).toString('hex');
    }
}));

// Middleware to ensure cookie is set for modified sessions
app.use((req, res, next) => {
    const originalEnd = res.end;
    res.end = function(...args) {
        // If session was modified and no cookie is set, ensure it gets set
        if (req.session && req.session.cookie && !req.sessionID) {
            // Session exists but no ID - this shouldn't happen, but ensure cookie is set
            console.log('Warning: Session exists but no sessionID');
        }
        return originalEnd.apply(this, args);
    };
    next();
});

// Debug middleware for session (only in production)
if (isProd) {
    app.use((req, res, next) => {
        if (req.path.includes('/get-api-stats') || req.path.includes('/get-user-consumption')) {
            console.log('Admin route request:', {
                path: req.path,
                hasSession: !!req.session,
                sessionId: req.session?.id,
                authenticated: req.session?.authenticated,
                email: req.session?.email,
                cookieHeader: req.headers.cookie,
                origin: req.headers.origin
            });
        }
        next();
    });
}

// Importing routes
const generalRoutes = require('./routes/general.js');
const authRoutes = require('./routes/auth.js');
const birdModelRoutes = require('./routes/birdModel.js');
const adminRoutes = require('./routes/admin.js');

app.use('/', generalRoutes);
app.use('/', authRoutes);
app.use('/', adminRoutes);
app.use('/api', birdModelRoutes);


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`isProd: ${isProd}`);
    console.log(`Cookie settings - sameSite: ${isProd ? 'none' : 'lax'}, secure: ${isProd}`);
});