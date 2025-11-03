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

module.exports = router;