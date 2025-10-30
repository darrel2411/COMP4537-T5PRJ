const database = include('databaseConnection');

async function createUser(userData) {
    const createUserSQL = `
        INSERT INTO user 
        (email, password)
        VALUES
        (:email, :password);
    `;

    const params = {
        email: userData.email,
        password: userData.password,
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
        SELECT email, password 
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

module.exports = {
    createUser,
    getUser
}