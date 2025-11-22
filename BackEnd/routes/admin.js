const express = require("express");
const router = express.Router();
const db_admin = include("database/admin");
const { logEndpointRequest } = require("../utils");
const { messages } = require("../lang/messages/en/user")

router.get('/get-all-users', async (req, res) => {
    try {
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return; // Error response already sent

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
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return; // Error response already sent

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
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return; // Error response already sent

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