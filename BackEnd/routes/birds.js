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

router.get('/get-birds', async (req, res) => {
    const { userId } = req.query;
    
    // Log the request (use userId from query if provided, otherwise from session)
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

router.get('/get-bird-info', async (req, res) => {
    // Get userId from session for logging (optional - endpoint works without auth)
    let userId = null;
    if (req.session && req.session.authenticated && req.session.email) {
        const results = await db_user.getUser(req.session.email);
        if (results && results.length > 0) {
            userId = results[0].user_id;
        }
    }

    // Log the request if we have a userId, otherwise proceed without logging
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