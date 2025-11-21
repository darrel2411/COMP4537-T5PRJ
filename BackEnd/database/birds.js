// This code was developed with assistance from OpenAI's ChatGPT.

const database = include('databaseConnection');

/**
 * Get user by user_id with api_consumption and score
 */
async function getUserById(userId) {
    const getUserSQL = `
        SELECT user_id, email, name, api_consumption, score
        FROM user
        WHERE user_id = :user_id;
    `;

    const params = { user_id: userId };

    try {
        const result = await database.query(getUserSQL, params);
        if (result[0] && result[0].length > 0) {
            return result[0][0];
        }
        return null;
    } catch (err) {
        console.log("Error retrieving user by ID");
        console.log(err);
        return null;
    }
}

/**
 * Get user by email with user_id, api_consumption and score
 */
async function getUserByEmail(email) {
    const getUserSQL = `
        SELECT user_id, email, name, api_consumption, score
        FROM user
        WHERE email = :email;
    `;

    const params = { email: email };

    try {
        const result = await database.query(getUserSQL, params);
        if (result[0] && result[0].length > 0) {
            return result[0][0];
        }
        return null;
    } catch (err) {
        console.log("Error retrieving user by email");
        console.log(err);
        return null;
    }
}

/**
 * Update user's api_consumption
 */
async function incrementApiConsumption(userId) {
    const updateSQL = `
        UPDATE user
        SET api_consumption = api_consumption + 1
        WHERE user_id = :user_id;
    `;

    const params = { user_id: userId };

    try {
        const result = await database.query(updateSQL, params);
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log("Error incrementing api_consumption");
        console.log(err);
        return false;
    }
}

/**
 * Update user's score
 */
async function updateUserScore(userId, newScore) {
    const updateSQL = `
        UPDATE user
        SET score = :score
        WHERE user_id = :user_id;
    `;

    const params = { 
        user_id: userId,
        score: newScore
    };

    try {
        const result = await database.query(updateSQL, params);
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log("Error updating user score");
        console.log(err);
        return false;
    }
}

/**
 * Find bird by name (case-insensitive)
 */
async function findBirdByName(birdName) {
    const findBirdSQL = `
        SELECT bird_id, name, scientific_name, fun_fact, rare_type_id
        FROM bird
        WHERE LOWER(name) = LOWER(:name);
    `;

    const params = { name: birdName };

    try {
        const result = await database.query(findBirdSQL, params);
        if (result[0] && result[0].length > 0) {
            return result[0][0];
        }
        return null;
    } catch (err) {
        console.log("Error finding bird by name");
        console.log(err);
        return null;
    }
}

/**
 * Check if bird is already in user's collection
 */
async function checkBirdInCollection(userId, birdId) {
    const checkSQL = `
        SELECT collection_id
        FROM collection
        WHERE user_id = :user_id AND bird_id = :bird_id;
    `;

    const params = {
        user_id: userId,
        bird_id: birdId
    };

    try {
        const result = await database.query(checkSQL, params);
        return result[0] && result[0].length > 0;
    } catch (err) {
        console.log("Error checking bird in collection");
        console.log(err);
        return false;
    }
}

/**
 * Add bird to user's collection
 */
async function addBirdToCollection(userId, birdId, imgId) {
    const insertSQL = `
        INSERT INTO collection (user_id, bird_id, img_id)
        VALUES (:user_id, :bird_id, :img_id);
    `;

    const params = {
        user_id: userId,
        bird_id: birdId,
        img_id: imgId
    };

    try {
        const result = await database.query(insertSQL, params);
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log("Error adding bird to collection");
        console.log(err);
        return false;
    }
}

/**
 * Get rare type score and type by rare_type_id
 */
async function getRareTypeInfo(rareTypeId) {
    const getScoreSQL = `
        SELECT score, rare_type
        FROM rare_type
        WHERE rare_type_id = :rare_type_id;
    `;

    const params = { rare_type_id: rareTypeId };

    try {
        const result = await database.query(getScoreSQL, params);
        if (result[0] && result[0].length > 0) {
            return {
                score: result[0][0].score,
                rare_type: result[0][0].rare_type
            };
        }
        return { score: 0, rare_type: null };
    } catch (err) {
        console.log("Error getting rare type score");
        console.log(err);
        return { score: 0, rare_type: null };
    }
}

/**
 * Create an image entry and return the img_id
 */
async function createImageEntry(imgTitle, imgUrl = '') {
    const createImageSQL = `
        INSERT INTO image (img_title, img_url)
        VALUES (:img_title, :img_url);
    `;

    const params = {
        img_title: imgTitle || 'bird_image',
        img_url: imgUrl
    };

    try {
        const result = await database.query(createImageSQL, params);
        return result[0].insertId;
    } catch (err) {
        console.log("Error creating image entry");
        console.log(err);
        return null;
    }
}

async function getAllBirds() {
    const getBirdsSQL = `
        SELECT b.name, rt.rare_type, rt.score
        FROM bird b
        INNER JOIN rare_type rt 
            ON b.rare_type_id = rt.rare_type_id;
    `;


    try {
         const result = await database.query(getBirdsSQL);
        console.log("Successfully created user")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving birds");
        console.log(err);
        return null;
    }
}

async function getBirdType() {
    const getBirdTypesSQL = `
        SELECT rare_type_id, rare_type, score
        FROM rare_type;
    `;


    try {
         const result = await database.query(getBirdTypesSQL);
        console.log("Successfully created user")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving birds");
        console.log(err);
        return null;
    }
}

async function getBirdsByType(data) {
    const getBirdsByTypesSQL = `
        SELECT b.bird_id, b.name, rt.rare_type_id, rt.rare_type, rt.score
        FROM bird b
        INNER JOIN rare_type rt
            ON b.rare_type_id = rt.rare_type_id
        WHERE b.rare_type_id = :rare_type_id;
    `;

    const params ={
        rare_type_id: data.rare_type_id,
    }


    try {
         const result = await database.query(getBirdsByTypesSQL, params);
        console.log("Successfully created user")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving birds");
        console.log(err);
        return null;
    }
}


module.exports = {
    getUserById,
    getUserByEmail,
    incrementApiConsumption,
    updateUserScore,
    findBirdByName,
    checkBirdInCollection,
    addBirdToCollection,
    getRareTypeInfo,
    getAllBirds,
    createImageEntry,
    getBirdsByType,
    getBirdType,
};

