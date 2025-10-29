require("./utils");
require("dotenv").config();

const { messages } = require("./lang/messages/en/user.js");
const express = require("express");
const cors = require("cors");
const { ok } = require("assert");

const app = express();
const PORT =  process.env.PORT || 5050;

// Middleware
app.use(cors()); // Allow frontend to connect 
app.use(express.json()); // Parse incoming JSON requests

const { printMySQLVersion } = include('database/db_utils');

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


app.listen(PORT,  () => {
    console.log(`Server running on http://localhost:${ PORT }`);
});