const express = require("express");
const router = express.Router();
const db_admin = include("database/admin");
const { logEndpointRequest } = require("../utils");
const { messages } = require("../lang/messages/en/user")

/**
 * @swagger
 * /get-all-users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 msg:
 *                   type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/get-all-users', async (req, res) => {
    try {
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return;

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

/**
 * @swagger
 * /get-api-stats:
 *   get:
 *     summary: Get API usage statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: API statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 apiStats:
 *                   type: array
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/get-api-stats', async (req, res) => {
    try {
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return;

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

/**
 * @swagger
 * /get-user-consumption:
 *   get:
 *     summary: Get user API consumption data (Admin only)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User consumption statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 userConsumption:
 *                   type: array
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/get-user-consumption', async (req, res) => {
    try {
        const userId = await logEndpointRequest(req, res, "GET", {
            userNotFound: messages.userNotFound,
            unauthorized: messages.unauthorized,
            failedToLogRequest: "Failed to log request"
        });
        if (!userId) return;

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