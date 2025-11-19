export const messages = {
    welcome: 'Hello world!',
    successfullyCreatedTables: 'Tables have been created successfully!',
    errorCreatingTables: 'Something went wrong! Tables were not created, try again!',
    invalidUserCreation: 'Missing email, or password',
    successUserCreation: 'successfully created user',
    failUserCreation: 'Information received, but failed to insert user',
    successAuthentication: 'Succesfully retrieve user',
    invalidPassword: 'Invalid password',
    userNotFound: 'User not found!',
    successRetrieveUsers: 'Users successfully retrieve',
    invalidNumberUser : (count) => `Invalid number of users matched: ${results.length} (expected 1)`,
    unauthorizedAccess: 'Unauthorized access. Please log in.',
    insufficientPermissions: 'Insufficient permissions. Admin access required.',
    invalidEmail: 'Invalid email provided.',
    cannotDeleteSelf: 'Cannot delete your own account.',
    successDeleteUser: 'User successfully deleted.',
    errorDeleteUser: 'Error occurred while deleting user.'
}