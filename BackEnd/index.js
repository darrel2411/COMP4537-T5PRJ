require("./utils");
require("dotenv").config();

const { messages } = require("./lang/messages/en/user.js");
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcrypt');
const saltRounds = 12;

const app = express();
const PORT =  process.env.PORT || 5050;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true  // Allows to send cookies
})); // Allow frontend to connect 
app.use(express.json()); // Parse incoming JSON requests

const { printMySQLVersion } = include('database/db_utils');
const db_users = include('database/users');

printMySQLVersion();

app.get("/", (req, res) => {
    res.json({ msg: messages.welcome, ok: true });
});

app.get('/createTables', async (req, res) => {
    const create_tables = include('database/create_tables');

    var success = create_tables.createTables();
    if (success) {
        res.json({ msg: messages.successfullyCreatedTables, ok: true });
    }
    else {
        res.json({ msg: messages.errorCreatingTables, ok: false });
    }
});

app.post('/createUser', async (req, res) => {
    const { email, password } = req.body;

    if (!email|| !password) {
        return res.status(400).json({ ok: false, msg: messages.invalidUserCreation });
    }

    const hashPassword = bcrypt.hashSync(password, saltRounds);

    const success = await db_users.createUser({ email: email, password: hashPassword });

    if (success) {
        res.status(200).json({ msg: messages.successUserCreation, ok: true });
        return;
    }

    res.status(500).json({ msg: messages.failUserCreation, ok: false });
});

app.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;

    const results = await db_users.getUser(email);

    if (results) {
        if (results.length == 1) { // There should only be one user
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                res.json({ msg: messages.successAuthentication, ok: true });
                return;
            } else {
                console.log("Invalid password");
                res.json({ msg: messages.invalidPassword, ok: false });
                return;
            }
        } else {
            console.log(messages.invalidNumberUser);
            res.json({ msg: messages.invalidNumberUser, ok: false });
            return;
        }
    }

    res.json({ msg: messages.userNotFound, ok: false });
});


app.listen(PORT,  () => {
    console.log(`Server running on http://localhost:${ PORT }`);
});