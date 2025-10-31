const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;

const db_users = include('database/users');
const { messages } = require('../lang/messages/en/user');

router.get('/check-auth', (req, res) => {
    res.json({
        ok: req.session.authenticated,
        email: req.session.email,
    })
});

router.post('/createUser', async (req, res) => {
    const { email, name, password } = req.body;

    if (!email|| !name || !password) {
        return res.status(400).json({ ok: false, msg: messages.invalidUserCreation });
    }

    const hashPassword = bcrypt.hashSync(password, saltRounds);

    const success = await db_users.createUser({ 
        email: email.trim(), 
        name: name.trim(), 
        password: hashPassword 
    });

    if (success) {
        req.session.authenticated = true;
        req.session.email = email;
        req.session.name = name;

        res.status(200).json({ msg: messages.successUserCreation, ok: true });
        return;
    }

    res.status(500).json({ msg: messages.failUserCreation, ok: false });
});

router.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;

    const results = await db_users.getUser(email);

    if (results) {
        if (results.length == 1) { // There should only be one user
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                req.session.authenticated = true;
                req.session.email = email;
                req.session.name = results[0].name;

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

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ ok: false });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

module.exports = router;