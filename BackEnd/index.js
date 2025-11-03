require("./utils");
require("dotenv").config();

const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true  // Allows to send cookies
})); // Allow frontend to connect 
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
    cookie: {
        maxAge: expireTime,
        sameSite: 'lax',   // allow cross-port requests on localhost
        secure: false      // set true in production (HTTPS)
    }
}));

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
});