const express = require("express");
const router = express.Router();
const db_birds = include("database/birds");
const db_user = include("database/users");
const { messages } = require("../lang/messages/en/user");

router.get('/get-birds', async (req, res) => {
    const { userId } = req.query;
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
    })
});

module.exports = router;