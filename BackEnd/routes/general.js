const express = require('express');
const router = express.Router();
const { messages } = require('../lang/messages/en/user');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 */
router.get("/", (req, res) => {
    res.json({ msg: messages.welcome, ok: true });
});

/**
 * @swagger
 * /createTables:
 *   get:
 *     summary: Create database tables
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Tables created successfully or error message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */
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