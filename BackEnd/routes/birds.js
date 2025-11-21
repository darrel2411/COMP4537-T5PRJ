const express = require("express");
const router = express.Router();
const db_birds = include("database/birds");
const { messages } = require("../lang/messages/en/user");

router.get('/get-birds', async (req, res) => {
    const birds = await db_birds.getAllBirds();
    const birdTypes = await db_birds.getBirdType();
    const groupedBirds = {}

    for (const element of birdTypes) {
        groupedBirds[element.rare_type_id] = await db_birds.getBirdsByType({
            rare_type_id: element.rare_type_id,
        });
    }

    return res.json({
        msg: messages.successRetrieveBirds,
        ok: true,
        birds: birds,
        birdTypes: birdTypes,
        groupedBirds: groupedBirds,
    })
});

module.exports = router;