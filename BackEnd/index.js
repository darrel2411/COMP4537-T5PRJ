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
        // sameSite: 'lax',   // allow cross-port requests on localhost
        // secure: false      // set true in production (HTTPS)
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        // Don't set domain - let browser handle it
    }
}));

// Middleware to log Set-Cookie headers on responses (for debugging)
if (isProd) {
    app.use((req, res, next) => {
        // Log Set-Cookie after response is sent
        const originalJson = res.json;
        res.json = function(body) {
            if (req.path.includes('/authenticateUser') && body && body.ok) {
                // Check after the response is being prepared
                setTimeout(() => {
                    const headers = res.getHeaders();
                    console.log('Response headers after login:', {
                        setCookie: headers['set-cookie'],
                        allHeaders: Object.keys(headers)
                    });
                }, 100);
            }
            return originalJson.call(this, body);
        };
        next();
    });
}

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