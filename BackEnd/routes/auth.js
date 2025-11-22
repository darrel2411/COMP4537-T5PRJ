const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;

const db_users = include('database/users');
const { messages } = require('../lang/messages/en/user');
const { logEndpointRequest } = require('../utils');

const logMessages = {
    userNotFound: messages.userNotFound,
    unauthorized: messages.unauthorized,
    failedToLogRequest: messages.failedToLogRequest,
};

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

        const loggedUserId = await logEndpointRequest(
            req,
            res,
            "GET",
            logMessages,
            user.user_id
        );
        if (!loggedUserId) return;

        res.json({
            ok: true,
            email: req.session.email,
            name: user.name,
            user_type_id: user.user_type_id,
            api_consumption: user.api_consumption,
            score: user.score,
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

        // fetch created user to get user_id
        const created = await db_users.getUser(email.trim());
        const user = Array.isArray(created) ? created[0] : created;
        const userId = user?.user_id ?? null;

        if (userId) {
            const loggedUserId = await logEndpointRequest(
                req,
                res,
                "POST",
                logMessages,
                userId
            );
            if (!loggedUserId) return;
        }

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
            const user = results[0];
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                req.session.authenticated = true;
                req.session.email = email;
                req.session.name = results[0].name;

                // res.json({ msg: messages.successAuthentication, ok: true });
                req.session.user_type_id = results[0].user_type_id;

                const loggedUserId = await logEndpointRequest(
                    req,
                    res,
                    "POST",
                    logMessages,
                    user.user_id           // <- we already know it
                );
                if (!loggedUserId) return; // logging failed & response already sent

                res.json({
                    msg: messages.successAuthentication,
                    ok: true,
                    email,
                    name: results[0].name,
                    user_type_id: results[0].user_type_id,
                    api_consumption: results[0].api_consumption,
                    score: results[0].score,
                });
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

router.delete('/delete-user/:email', async (req, res) => {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: "Email parameter is required",
        });
    }

    try {
        const result = await db_users.deleteUser(email.trim().toLowerCase());

        if (!result) {
            // nothing deleted
            return res.status(404).json({
                ok: false,
                msg: "User not found or already deleted",
            });
        }

        console.log("this is req.session >>>" + JSON.stringify(req.session))
        // If the deleted user is the one currently logged in, clean up the session
        if (req.session && req.session.email === email) {
            req.session.destroy(err => {
                if (err) {
                    console.error("Error destroying session after delete:", err);
                    return res.status(500).json({
                        ok: false,
                        msg: "User deleted but session cleanup failed",
                    });
                }
                res.clearCookie('connect.sid');
                return res.json({
                    ok: true,
                    msg: "User deleted successfully",
                });
            });
        } else {
            // Deleted some other user (e.g., admin deleting another account)
            return res.json({
                ok: true,
                msg: "User deleted successfully",
            });
        }

    } catch (err) {
        console.error("Error in /delete-user:", err);
        return res.status(500).json({
            ok: false,
            msg: "Server error while deleting user",
        });
    }
});

router.patch('/user/:email', async (req, res) => {
    const { email } = req.params;
    const { name, currentPassword, newPassword } = req.body;

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: "Email parameter is required",
        });
    }

    // Only allow the logged-in user to update themselves
    if (!req.session || !req.session.authenticated || req.session.email !== email) {
        return res.status(403).json({
            ok: false,
            msg: "You are not allowed to update this user",
        });
    }

    try {
        // get user from DB
        const result = await db_users.getUser(email);
        if (!result || result.length !== 1) {
            return res.status(404).json({
                ok: false,
                msg: "User not found",
            });
        }

        const user = result[0];

        // data object to be updated
        const updateData = {};

        // check if name is to be updated
        if (name) {
            updateData.name = name;
        }

        // check if password to be updated
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    ok: false,
                    msg: "Current password is required to change password",
                });
            } else {
                const checkPasswordMatch = await bcrypt.compare(currentPassword, user.password);
                if (!checkPasswordMatch) {
                    return res.status(400).json({
                        ok: false,
                        msg: "Current password is incorrect",
                    });
                } else {
                    // If current password is correct, hash the new one
                    updateData.password = bcrypt.hashSync(newPassword.trim(), saltRounds);
                }
            }
        }

        console.log(`this is update data ==>. ${JSON.stringify(updateData)}`)

        // if no data is to be updated, return 400
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                ok: false,
                msg: "No valid fields provided to update",
            });
        }

        // try to update
        const updateResult = await db_users.updateUser(email.trim().toLowerCase(), updateData);
        console.log(`update result is ${updateResult}`)
        if (!updateResult || updateResult.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                msg: "User not found or no changes applied",
            });
        }

        // Keep session in sync for name
        if (updateData.name) {
            req.session.name = updateData.name;
        }

        const loggedUserId = await logEndpointRequest(
            req,
            res,
            "PATCH",
            logMessages,
            user.user_id
        );
        if (!loggedUserId) return;

        return res.json({
            ok: true,
            msg: "Profile updated successfully",
        });


    } catch (err) {
        console.error("Error in /user/:email", err);
        return res.status(500).json({
            ok: false,
            msg: "Server error while updating user",
        });
    }
});

module.exports = router;