require("./utils");
require("dotenv").config();

const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5050;
const isProd = process.env.NODE_ENV === "production";

// Middleware
app.use(cors({
    origin: [
        "https://comp-4537-t5-prj.vercel.app", // Vercel frontend
        "http://localhost:5173",                // local dev frontend
        `http://localhost:${PORT}`,            // Swagger UI (local)
        "https://birdquest-backend.onrender.com" // Swagger UI (Render - same origin)
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

// Trust proxy in production (for Render)
if (isProd) {
    app.set('trust proxy', 1);
}

app.use(session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false, // Don't save uninitialized sessions
    resave: false, // Don't resave unchanged sessions
    name: 'connect.sid',
    cookie: {
        maxAge: expireTime,
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd
        // Don't set domain - let browser handle cross-site cookies
    },
    rolling: false,
    genid: (req) => {
        return require('crypto').randomBytes(16).toString('hex');
    }
}));

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Bird Classification API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        withCredentials: true,
        requestInterceptor: (req) => {
            // Ensure cookies are sent with requests
            req.credentials = 'include';
            return req;
        }
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
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});