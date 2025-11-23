const express = require("express");
const router = express.Router();
const db_birds = include("database/birds");
const db_user = include("database/users");
const { messages } = require("../lang/messages/en/user");
const { logEndpointRequest } = require('../utils');

const logMessages = {
    userNotFound: messages.userNotFound,
    unauthorized: messages.unauthorized,
    failedToLogRequest: messages.failedToLogRequest,
};

/**
 * @swagger
 * /get-birds:
 *   get:
 *     summary: Get all birds, bird types, grouped birds, and user collection
 *     tags: [Birds]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *         description: User ID to retrieve collection for
 *     responses:
 *       200:
 *         description: Successfully retrieved birds data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                 birds:
 *                   type: array
 *                   items:
 *                     type: object
 *                 birdTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 groupedBirds:
 *                   type: object
 *                 collections:
 *                   type: object
 *       401:
 *         description: Unauthorized
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
router.get('/get-birds', async (req, res) => {
    const { userId } = req.query;
    
    const loggedUserId = await logEndpointRequest(
        req,
        res,
        "GET",
        logMessages,
        userId || null
    );
    if (!loggedUserId) return;
    
    console.log('USER ID:', userId);
    const birds = await db_birds.getAllBirds();
    const birdTypes = await db_birds.getBirdType();
    const userCollection = await db_user.getUserCollection({ user_id: userId});
    const groupedBirds = {};
    const collections = {};

    for (const element of birdTypes) {
        groupedBirds[element.rare_type_id] = await db_birds.getBirdsByType({
            rare_type_id: element.rare_type_id,
        });
    }

    for (const collection of userCollection){
        collections[collection.bird_id] = await db_birds.getBirdsImage({ img_id: collection.img_id});
    }

    return res.json({
        msg: messages.successRetrieveBirds,
        ok: true,
        birds: birds,
        birdTypes: birdTypes,
        groupedBirds: groupedBirds,
        collections: collections,
    });
});

/**
 * @swagger
 * /get-bird-info:
 *   get:
 *     summary: Get detailed information about a specific bird
 *     tags: [Birds]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: birdId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the bird to retrieve information for
 *     responses:
 *       200:
 *         description: Successfully retrieved bird information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                 ok:
 *                   type: boolean
 *                 bird:
 *                   type: object
 *       400:
 *         description: Bad request - birdId parameter missing
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
router.get('/get-bird-info', async (req, res) => {
    let userId = null;
    if (req.session && req.session.authenticated && req.session.email) {
        const results = await db_user.getUser(req.session.email);
        if (results && results.length > 0) {
            userId = results[0].user_id;
        }
    }

    if (userId) {
        const loggedUserId = await logEndpointRequest(
            req,
            res,
            "GET",
            logMessages,
            userId
        );
        if (!loggedUserId) return;
    }

    const { birdId } = req.query;

    const bird = await db_birds.getBirdById({ 
        bird_id: birdId,
    });

    return res.json({
        msg: messages.successRetrieveBirds,
        ok: true,
        bird: bird,
    })
});

module.exports = router;