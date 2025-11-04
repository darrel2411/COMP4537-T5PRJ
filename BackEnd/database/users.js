const database = include('databaseConnection');

async function createUser(userData) {
    const createUserSQL = `
        INSERT INTO user 
        (email, name, password, user_type_id, created_at, updated_at, img_id)
        VALUES
        (:email, :name, :password, :user_type_id, :created_at, :updated_at, :img_id);
    `;

    const params = {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        user_type_id: 2,
        created_at: new Date(),
        updated_at: new Date(),
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
        SELECT email, password, name, user_type_id
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

module.exports = {
    createUser,
    getUser,
    getUserContext
}