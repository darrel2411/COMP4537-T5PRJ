const database = include('databaseConnection');

async function createUser(userData) {
    const createUserSQL = `
        INSERT INTO user 
        (email, name, password, user_type_id, img_id)
        VALUES
        (:email, :name, :password, :user_type_id, :img_id);
    `;

    const params = {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        user_type_id: 2,
        img_id: null
    }

    try {
        const result = await database.query(createUserSQL, params);
        console.log("Successfully created user")
        console.log(result[0]);
        return true;
    } catch (err) {
        console.log("Error inserting user");
        console.log(err);
        return false;
    }
}

async function getUser(email) {
    const getUserSQL = `
        SELECT user_id, email, password, name, user_type_id, api_consumption, score
        FROM user
        WHERE email = :email;
    `;

    const params = {
        email: email
    }

    try {
        const result = await database.query(getUserSQL, params);
        console.log("Successfully retrieve user");
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving user");
        console.log(err);
        return null;
    }
}

async function getUserContext(email) {
    const getUserContextSQL = `
        SELECT user_id, email, name, user_type_id, api_consumption, score, img.img_url
        FROM user u
        INNER JOIN image img
            ON u.img_id = img.img_id
        WHERE email = :email;
    `;

    const params = {
        email: email
    }

    try {
        const result = await database.query(getUserContextSQL, params);
        console.log("Successfully retrieve user");
        console.log(result[0]);
        return result[0][0];
    } catch (err) {
        console.log("Error retrieving user");
        console.log(err);
        return null;
    }
}

// async function getUserIdByEmail(email) {
//     const getUserIdSQL = `
//         SELECT user_id 
//         FROM user
//         WHERE email = :email;
//     `;

//     const params = {
//         email: email
//     }

//     try {
//         const result = await database.query(getUserIdSQL, params);
//         if (result[0] && result[0].length > 0) {
//             return result[0][0].user_id;
//         }
//         return null;
//     } catch (err) {
//         console.log("Error retrieving user_id");
//         console.log(err);
//         return null;
//     }
// }

async function deleteUser(email) {
    const deleteUserSQL = `
        DELETE FROM user
        WHERE email = :email;
    `;

    const params = {
        email: email
    };

    try {
        const result = await database.query(deleteUserSQL, params);
        console.log("Successfully deleted user");
        console.log(result[0]);
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log("Error deleting user in database");
        console.log(err);
        return false;
    }
}

async function updateUser(email, fields) {
    const params = {
        email: email
    };

    const keys = Object.keys(fields);
    if (keys.length === 0) return { affectedRows: 0 };


    // build SET clause like: "name = :name, password = :password"
    const setClause = keys
        .map((key) => {
            params[key] = fields[key];   // add each field to params
            return `${key} = :${key}`;   // create "col = :col"
        })
        .join(", ");

    const updateUserSQL = `
    UPDATE user
    SET ${setClause}
    WHERE email = :email
  `;

    try {
        const [result] = await database.query(updateUserSQL, params);
        console.log("Successfully updated user");
        console.log(result);           // 👈 this is the ResultSetHeader
        return result.affectedRows > 0;
    } catch (err) {
        console.log("Error updating user in database");
        console.log(err);
        return false;
    }

}

async function getUserCollection(data) {
    const getUserCollectionSQL = `
        SELECT c.collection_id, c.user_id, c.bird_id, c.img_id
        FROM collection c
        INNER JOIN bird b
            ON c.bird_id = b.bird_id
        WHERE c.user_id = :user_id;
    `;

    const params ={
        user_id: data.user_id,
    }


    try {
         const result = await database.query(getUserCollectionSQL, params);
        console.log("Successfully retrieve user collections")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving user collections");
        console.log(err);
        return null;
    }
}

async function getProfilePictureID(data) {
    const getProfilePictureIDSQL = `
        SELECT img.img_id, img.img_public_id
        FROM user u
        INNER JOIN image img
            ON u.img_id = img.img_id
        WHERE user_id = :user_id;
    `;

    const params ={
        user_id: data.user_id,
    }


    try {
         const result = await database.query(getProfilePictureIDSQL, params);
        console.log("Successfully retrieve user profile image Id")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving user profile image Id");
        console.log(err);
        return null;
    }
}

async function UploadImage(data) {
    const UploadImageSQL = `
        INSERT INTO image
        (img_title, img_url, img_public_id)
        VALUE
        (:img_title, :img_url, :img_public_id)
    `;

    const params ={
        img_title: 'Profle image',
        img_url: data.img_url,
        img_public_id: data.img_public_id,
    }


    try {
         const result = await database.query(UploadImageSQL, params);
        console.log("Successfully inserting image")
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error inserting image");
        console.log(err);
        return null;
    }
}

async function deleteImage(data) {
    const deleteImageSQL = `
        DELETE
        FROM image
        WHERE img_id = :img_id;
    `;

    const params ={
        img_id: data.img_id,
    }


    try {
         const result = await database.query(deleteImageSQL, params);
        console.log("Successfully deleted user profile image Id")
        console.log(result[0]);
        return true;
    } catch (err) {
        console.log("Error deleted user profile image Id");
        console.log(err);
        return false;
    }
}

async function updateImageId(data) {
    const updateImageIdSQL = `
        UPDATE user
        SET img_id = :img_id
        WHERE user_id = :user_id;
    `;

    const params ={
        user_id: data.user_id,
        img_id: data.img_id,
    }


    try {
         const result = await database.query(updateImageIdSQL, params);
        console.log("Successfully deleted user profile image Id")
        console.log(result[0]);
        return true;
    } catch (err) {
        console.log("Error deleted user profile image Id");
        console.log(err);
        return false;
    }
}


module.exports = {
    createUser,
    getUser,
    getUserContext,
    // getUserIdByEmail
    updateUser,
    deleteUser,
    getUserCollection,
    getProfilePictureID,
    UploadImage,
    updateImageId,
    deleteImage,
}