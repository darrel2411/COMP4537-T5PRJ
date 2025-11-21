module.exports = {
    userNotFound: "User not found",
    unauthorized: "Unauthorized",
    noImageFile: "No image file provided",
    apiLimitReached: "API limit reached",
    failedToLogRequest: "Failed to log request",
    modelApiError: (status, errorText) => `Model API returned ${status}: ${errorText}`,
    birdDiscovered: (rareType) => rareType 
        ? `Congratulations! You discovered a new bird (${rareType})!`
        : "Congratulations! You discovered a new bird!",
    birdAlreadyFound: "You already found this bird.",
    birdNotFoundInDatabase: "Bird not found in database.",
    internalServerError: "Internal server error"
};

