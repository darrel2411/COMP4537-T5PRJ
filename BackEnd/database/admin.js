const database = include('databaseConnection');

async function getAllUsers() {
    const getAllUsersSQL = `
        SELECT 
            user_id,
            email, 
            name, 
            ut.user_type,
            created_at
        FROM user u
        INNER JOIN user_type ut
            ON u.user_type_id = ut.user_type_id
        ;
    `;

    try {
        const result = await database.query(getAllUsersSQL);
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
    getAllUsers
}