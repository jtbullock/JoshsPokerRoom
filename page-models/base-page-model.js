module.exports = req =>
    (layout) => {
        const model = {
            isLoggedIn: req.oidc.isAuthenticated(),
        };

        if (model.isLoggedIn) {
            model.userEmail = req.oidc.user.email;
        }

        if (layout) {
            model.layout = layout;
        }

        return model;
    };