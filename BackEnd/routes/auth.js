const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 12;

const db_users = include('database/users');
const { messages } = require('../lang/messages/en/user');
const { logEndpointRequest } = require('../utils');

const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const { ok } = require("assert");
const db_passwordReset = include('database/password_reset');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Global transporter (will be filled after test account is created)
let transporter = null;

// Create a test account for Ethereal
nodemailer.createTestAccount().then(testAccount => {
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    console.log("Ethereal email ready!");
    console.log("Test account:", testAccount.user);
}).catch(err => {
    console.error("Failed to create Ethereal test account", err);
});

async function sendResetEmail(to, link) {
    if (!transporter) {
        console.error("Email transporter not ready yet");
        return;
    }

    const info = await transporter.sendMail({
        from: '"BirdQuest" <no-reply@birdquest.com>',
        to,
        subject: "Reset your BirdQuest password",
        html: `
            <p>You requested a password reset.</p>
            <p>Click this link to reset your password:</p>
            <p><a href="${link}">${link}</a></p>
            <p>This link expires in 1 hour.</p>
        `,
    });

    console.log("Reset email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}

const logMessages = {
    userNotFound: messages.userNotFound,
    unauthorized: messages.unauthorized,
    failedToLogRequest: messages.failedToLogRequest,
};

/**
 * @swagger
 * /check-auth:
 *   get:
 *     summary: Check authentication status
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Authentication status and user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 email:
 *                   type: string
 *                   nullable: true
 *                 name:
 *                   type: string
 *                   nullable: true
 *                 user_type_id:
 *                   type: integer
 *                   nullable: true
 *                 api_consumption:
 *                   type: integer
 *                 score:
 *                   type: integer
 */
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
            user_id: user.user_id,
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

/**
 * @swagger
 * /createUser:
 *   post:
 *     summary: Create a new user account
 *     tags: [Authentication]
 *     security: []  # No authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/createUser', async (req, res) => {
    const { email, name, password } = req.body;

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

/**
 * @swagger
 * /authenticateUser:
 *   post:
 *     summary: Authenticate user and create session
 *     tags: [Authentication]
 *     security: []  # No authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 user_type_id:
 *                   type: integer
 *                 api_consumption:
 *                   type: integer
 *                 score:
 *                   type: integer
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/authenticateUser', async (req, res) => {
    const { email, password } = req.body;

    const results = await db_users.getUser(email);

    if (results) {
        if (results.length == 1) { // There should only be one user
            const user = results[0];
            const isMatch = await bcrypt.compare(password, results[0].password);
            if (isMatch) {
                // Regenerate session to ensure new cookie is set
                req.session.regenerate((err) => {
                    if (err) {
                        console.error('Session regenerate error:', err);
                        return res.status(500).json({
                            ok: false,
                            msg: "Failed to create session"
                        });
                    }

                    // Set session data after regeneration
                    req.session.authenticated = true;
                    req.session.email = email;
                    req.session.name = results[0].name;
                    req.session.user_type_id = results[0].user_type_id;

                    // Explicitly save session to ensure cookie is set
                    req.session.save(async (saveErr) => {
                        if (saveErr) {
                            console.error('Session save error:', saveErr);
                            return res.status(500).json({
                                ok: false,
                                msg: "Failed to save session"
                            });
                        }

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
                    });
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

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout user and destroy session
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ ok: false });
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

/**
 * @swagger
 * /delete-user/{email}:
 *   delete:
 *     summary: Delete a user account
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /user/{email}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to update this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: "Email is required"
        });
    }

    try {
        const result = await db_users.getUser(email.trim());

        // If user not found, still return ok (do not reveal)
        if (!result || result.length === 0) {
            return res.json({
                ok: true,
                msg: "If this email exists, a reset link has been sent"
            });
        }

        const user = Array.isArray(result) ? result[0] : result;

        // create token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour

        const created = await db_passwordReset.createResetToken(user.user_id, token, expiresAt)

        if (!created) {
            return res.status(500).json({
                ok: false,
                msg: "Could not create reset token"
            })
        }

        const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

        // try send email
        try {
            await sendResetEmail(email.trim(), resetLink);
            console.log(`Sent password reset email to ${email}`);
        } catch (err) {
            console.error(`Error sending reset email to ${email}`);
        }

        return res.json({
            ok: true,
            msg: "If this email exists, a reset link has been sent"
        })


    } catch (error) {
        console.error("Error in /forgot-password", err);
        return res.status(500).json({
            ok: false,
            msg: "Server error while requesting password reset"
        });
    }


})

router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!email) {
        return res.status(400).json({
            ok: false,
            msg: "Token and new password is required"
        });
    }

    try {

        // find and check if token exists
        const record = await db_passwordReset.findValidToken(token);

        if (!record) {
            return res.status(400).json({
                ok: false,
                msg: "Reset link expired"
            })
        }

        const email = record.email;

        // hash new password
        const hashPassword = bcrypt.hashSync(password, saltRounds);

        const updateResult = await db_users.updateUser(email, {
            password: hashPassword
        })

        if (!updateResult || updateResult.affectedRows === 0) {
            return res.status(500).json({
                ok: false,
                msg: "Could not update password"
            })
        }

        // Mark token as used
        await db_passwordReset.markTokenUsed(token);

        return res.json({
            ok: true,
            msg: "Password has been updated"
        })

    } catch (error) {
        console.error("Error in /reset-password", err);
        return res.status(500).json({
            ok: false,
            msg: "Server error while resetting password"
        });
    }
})

module.exports = router;