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
        SELECT user_id, email, password, name, user_type_id
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
        SELECT email, name, user_type_id 
        FROM user
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


module.exports = {
    createUser,
    getUser,
    getUserContext,
    // getUserIdByEmail
    updateUser,
    deleteUser
}