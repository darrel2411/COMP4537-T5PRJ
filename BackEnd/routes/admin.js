const express = require("express");
const router = express.Router();
const db_admin = include("database/admin");
const { messages } = require("../lang/messages/en/user")

router.get('/get-all-users', async (req, res) => {
    const users = await db_admin.getAllUsers();

    res.json({
        ok: true,
        users: users,
        msg: messages.successRetrieveUsers
    });
});

router.get('/get-api-stats', async (req, res) => {
    const apiStats = await db_admin.getApiStats();

    res.json({
        ok: true,
        apiStats: apiStats || []
    });
});

router.get('/get-user-consumption', async (req, res) => {
    const userConsumption = await db_admin.getUserConsumption();

    res.json({
        ok: true,
        userConsumption: userConsumption || []
    });
});

module.exports = router;