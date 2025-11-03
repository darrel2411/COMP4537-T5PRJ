const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;

const db_users = include('database/users');
const { messages } = require('../lang/messages/en/user');

// router.get('/check-auth', async (req, res) => {
//     const user = await db_users.getUserContext(req.session.email);

//     res.json({
//         ok: req.session.authenticated,
//         email: req.session.email,
//         name: user.name,
//         user_type_id: user.user_type_id
//     })
// });
router.get('/check-auth', async (req, res) => {
    try {
        // If not authenticated, respond early
        if (!req.session.authenticated || !req.session.email) {
            return res.json({ ok: false, email: null, name: null, user_type_id: null });
        }

        // Otherwise, fetch user details from DB
        const user = await db_users.getUserContext(req.session.email);

        // Safely handle if user not found
        if (!user) {
            return res.json({ ok: false, email: req.session.email, name: null, user_type_id: null });
        }

        res.json({
            ok: true,
            email: req.session.email,
            name: user.name,
            user_type_id: user.user_type_id
        });
    } catch (err) {
        console.error("Error in /check-auth:", err);
        res.status(500).json({ ok: false, msg: "Server error while checking auth" });
    }
});

router.post('/createUser', async (req, res) => {
    const { email, name, password } = req.body;
    console.log(req.body);

    if (!email || !name || !password) {
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