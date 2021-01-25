let config = {};

function loadConfig() {
    config.auth = {
        secret: verifyHasValue('AUTH_SECRET'),
        baseURL: verifyHasValue('AUTH_BASE_URL'),
        clientID: verifyHasValue('AUTH_CLIENT_ID'),
        issuerBaseURL: verifyHasValue('AUTH_ISSUER_BASE_URL'),
        authRequired: verifyHasValue('AUTH_IS_REQUIRED'),
        auth0Logout: verifyHasValue('AUTH_AUTH0_LOGOUT')
    };

    config.cosmos = {
        endpoint: verifyHasValue('COSMOS_ENDPOINT'),
        key: verifyHasValue('COSMOS_KEY'),
        databaseId: verifyHasValue('COSMOS_DATABASE_ID'),
        containerId: verifyHasValue('COSMOS_CONTAINER_ID')
    };

    config.inviteCodes = verifyHasValue('INVITE_CODES');
}

function verifyHasValue(settingName) {
    const settingValue = process.env[settingName];

    if (!settingValue || !settingValue.trim()) {
        throw `Setting "${settingName}" is not configured`;
    }

    return settingValue;
}

module.exports = {
    loadConfig,
    config
};