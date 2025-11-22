// Define the inclide function for absilute file name
global.base_dir = __dirname;
global.abs_path = function(path){
    return base_dir + path;
}
global.include = function(file) {
    return require( abs_path('/' + file) );
}

/**
 * Gets userId from request and logs the endpoint request
 */
async function logEndpointRequest(req, res, method, errorMessages = {}, userId = null) {
    const db_users = include('database/users');
    const db_logging = include('database/logging');
    
    const defaultMessages = {
        userNotFound: "User not found",
        unauthorized: "Unauthorized",
        failedToLogRequest: "Failed to log request"
    };
    
    const messages = { ...defaultMessages, ...errorMessages };
    
    // Get userId from request if not provided
    if (userId === null) {
        if (req.user && req.user.id) {
            userId = req.user.id;
        } else if (req.session && req.session.authenticated && req.session.email) {
            const results = await db_users.getUser(req.session.email);
            if (!results || results.length === 0) {
                res.status(404).json({ error: messages.userNotFound });
                return null;
            }
            userId = results[0].user_id;
        } else {
            // Debug logging
            console.log('Session check failed:', {
                hasSession: !!req.session,
                authenticated: req.session?.authenticated,
                email: req.session?.email,
                sessionId: req.session?.id,
                cookies: req.headers.cookie
            });
            res.status(401).json({ error: messages.unauthorized });
            return null;
        }
    }
    
    // Log the request
    const methodId = await db_logging.getOrCreateMethod(method);
    if (!methodId) {
        console.error("Failed to get or create method");
        res.status(500).json({ error: messages.failedToLogRequest });
        return null;
    }
    
    const endpointId = await db_logging.getOrCreateEndpoint(methodId, req.baseUrl + req.path);
    if (!endpointId) {
        console.error("Failed to get or create endpoint");
        res.status(500).json({ error: messages.failedToLogRequest });
        return null;
    }
    
    await db_logging.logRequest(endpointId, userId);
    
    return userId;
}

module.exports = {
    logEndpointRequest
};