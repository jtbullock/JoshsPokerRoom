module.exports = req => {
    if (!req.oidc.isAuthenticated()) {
        return {isLoggedIn: false};
    }

    return {
        isLoggedIn: req.oidc.isAuthenticated(),
        userEmail: req.oidc.user.email
    };
};