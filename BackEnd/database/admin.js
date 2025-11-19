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

async function getApiStats() {
    const getApiStatsSQL = `
        SELECT 
            m.method AS Method,
            e.endpoint AS Endpoint,
            COUNT(r.request_id) AS 'Number of Requests'
        FROM method m
        INNER JOIN endpoint e ON m.method_id = e.method_id
        LEFT JOIN request r ON e.endpoint_id = r.endpoint_id
        GROUP BY m.method_id, m.method, e.endpoint_id, e.endpoint
        ORDER BY COUNT(r.request_id) DESC, m.method, e.endpoint;
    `;

    try {
        const result = await database.query(getApiStatsSQL);
        console.log("Successfully retrieved API stats");
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving API stats");
        console.log(err);
        return null;
    }
}

async function getUserConsumption() {
    const getUserConsumptionSQL = `
        SELECT 
            u.name AS Name,
            u.email AS Email,
            COUNT(r.request_id) AS 'Total number of requests'
        FROM user u
        LEFT JOIN request r ON u.user_id = r.user_id
        GROUP BY u.user_id, u.name, u.email
        ORDER BY COUNT(r.request_id) DESC, u.name;
    `;

    try {
        const result = await database.query(getUserConsumptionSQL);
        console.log("Successfully retrieved user consumption");
        console.log(`Total users found: ${result[0]?.length || 0}`);
        console.log(result[0]);
        return result[0];
    } catch (err) {
        console.log("Error retrieving user consumption");
        console.log(err);
        return null;
    }
}

module.exports = {
    getAllUsers,
    getApiStats,
    getUserConsumption
}