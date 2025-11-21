const database = include('databaseConnection');

/**
 * Get or create method and return method_id
 */
async function getOrCreateMethod(methodName) {
    // First, try to get existing method
    const getMethodSQL = `
        SELECT method_id
        FROM method
        WHERE method = :method;
    `;

    const params = { method: methodName };

    try {
        const result = await database.query(getMethodSQL, params);
        if (result[0] && result[0].length > 0) {
            return result[0][0].method_id;
        }

        // If not found, create it
        const insertMethodSQL = `
            INSERT INTO method (method)
            VALUES (:method);
        `;

        const insertResult = await database.query(insertMethodSQL, params);
        return insertResult[0].insertId;
    } catch (err) {
        console.log("Error getting or creating method");
        console.log(err);
        return null;
    }
}

/**
 * Get or create endpoint and return endpoint_id
 */
async function getOrCreateEndpoint(methodId, endpointPath) {
    // First, try to get existing endpoint
    const getEndpointSQL = `
        SELECT endpoint_id
        FROM endpoint
        WHERE method_id = :method_id AND endpoint = :endpoint;
    `;

    const params = {
        method_id: methodId,
        endpoint: endpointPath
    };

    try {
        const result = await database.query(getEndpointSQL, params);
        if (result[0] && result[0].length > 0) {
            return result[0][0].endpoint_id;
        }

        // If not found, create it
        const insertEndpointSQL = `
            INSERT INTO endpoint (method_id, endpoint)
            VALUES (:method_id, :endpoint);
        `;

        const insertResult = await database.query(insertEndpointSQL, params);
        return insertResult[0].insertId;
    } catch (err) {
        console.log("Error getting or creating endpoint");
        console.log(err);
        return null;
    }
}

/**
 * Log a request
 */
async function logRequest(endpointId, userId) {
    const insertSQL = `
        INSERT INTO request (endpoint_id, user_id)
        VALUES (:endpoint_id, :user_id);
    `;

    const params = {
        endpoint_id: endpointId,
        user_id: userId
    };

    try {
        const result = await database.query(insertSQL, params);
        return result[0].affectedRows > 0;
    } catch (err) {
        console.log("Error logging request");
        console.log(err);
        return false;
    }
}

module.exports = {
    getOrCreateMethod,
    getOrCreateEndpoint,
    logRequest
};

