const express = require("express");
const router = express.Router();
const db_admin = include("database/admin");
const db_users = include('database/users');
const db_logging = include('database/logging');
const { messages } = require("../lang/messages/en/user")

router.get('/get-all-users', async (req, res) => {
    try {
        let userId;
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.session.authenticated && req.session.email) {
            const results = await db_users.getUser(req.session.email);
            if (!results || results.length === 0) {
                return res.status(404).json({ error: messages.userNotFound });
            }
            userId = results[0].user_id;
        } else {
            return res.status(401).json({ error: messages.unauthorized });
        }

        const methodId = await db_logging.getOrCreateMethod("GET");
        if (!methodId) {
            console.error("Failed to get or create method");
            return res.status(500).json({ error: "Failed to log request" });
        }

        const endpointId = await db_logging.getOrCreateEndpoint(methodId, req.baseUrl + req.path);
        if (!endpointId) {
            console.error("Failed to get or create endpoint");
            return res.status(500).json({ error: "Failed to log request" });
        }

        await db_logging.logRequest(endpointId, userId);

        const users = await db_admin.getAllUsers();

        res.json({
            ok: true,
            users: users,
            msg: messages.successRetrieveUsers
        });
    } catch (err) {
        console.error("Error in get-all-users endpoint:", err.message);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
});

router.get('/get-api-stats', async (req, res) => {
    try {
        let userId;
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.session.authenticated && req.session.email) {
            const results = await db_users.getUser(req.session.email);
            if (!results || results.length === 0) {
                return res.status(404).json({ error: messages.userNotFound });
            }
            userId = results[0].user_id;
        } else {
            return res.status(401).json({ error: messages.unauthorized });
        }

        const methodId = await db_logging.getOrCreateMethod("GET");
        if (!methodId) {
            console.error("Failed to get or create method");
            return res.status(500).json({ error: "Failed to log request" });
        }

        const endpointId = await db_logging.getOrCreateEndpoint(methodId, req.baseUrl + req.path);
        if (!endpointId) {
            console.error("Failed to get or create endpoint");
            return res.status(500).json({ error: "Failed to log request" });
        }

        await db_logging.logRequest(endpointId, userId);

        const apiStats = await db_admin.getApiStats();

        res.json({
            ok: true,
            apiStats: apiStats || []
        });
    } catch (err) {
        console.error("Error in get-api-stats endpoint:", err.message);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
});

router.get('/get-user-consumption', async (req, res) => {
    try {
        let userId;
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.session.authenticated && req.session.email) {
            const results = await db_users.getUser(req.session.email);
            if (!results || results.length === 0) {
                return res.status(404).json({ error: messages.userNotFound });
            }
            userId = results[0].user_id;
        } else {
            return res.status(401).json({ error: messages.unauthorized });
        }

        const methodId = await db_logging.getOrCreateMethod("GET");
        if (!methodId) {
            console.error("Failed to get or create method");
            return res.status(500).json({ error: "Failed to log request" });
        }

        const endpointId = await db_logging.getOrCreateEndpoint(methodId, req.baseUrl + req.path);
        if (!endpointId) {
            console.error("Failed to get or create endpoint");
            return res.status(500).json({ error: "Failed to log request" });
        }

        await db_logging.logRequest(endpointId, userId);

        const userConsumption = await db_admin.getUserConsumption();

        res.json({
            ok: true,
            userConsumption: userConsumption || []
        });
    } catch (err) {
        console.error("Error in get-user-consumption endpoint:", err.message);
        res.status(500).json({ 
            error: "Internal server error",
            details: err.message 
        });
    }
});

module.exports = router;