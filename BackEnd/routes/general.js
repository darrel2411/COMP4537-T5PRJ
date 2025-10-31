const express = require('express');
const router = express.Router();
const { messages } = require('../lang/messages/en/user');

router.get("/", (req, res) => {
    res.json({ msg: messages.welcome, ok: true });
});

router.get('/createTables', async (req, res) => {
    const create_tables = include('database/create_tables');

    var success = create_tables.createTables();
    if (success) {
        res.json({ msg: messages.successfullyCreatedTables, ok: true });
    }
    else {
        res.json({ msg: messages.errorCreatingTables, ok: false });
    }
});

module.exports = router;