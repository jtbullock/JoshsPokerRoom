const basePageModel = require('./page-models/base-page-model');

function injectUserProfile(req, res, next) {
    if (req.oidc.isAuthenticated()) {
        req.isAuthenticated = true;
        req.userEmail = req.oidc.user.email;
    }

    next();
}

function injectBasePageModel(req, res, next) {
    req.basePageModel = basePageModel(req);
    next();
}

module.exports = {
    "injectUserProfile": injectUserProfile,
    "injectBasePageModel": injectBasePageModel
};