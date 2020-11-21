const express = require('express');
const handlebars = require('express-handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const config = require('config');

const app = express();
const port = 3000;

app.use(auth(config.get('auth')));

app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

app.use(express.static('public'));

app.get('/', (req, res) => {

    const model = getPageModel(req);
    model.layout = 'index';

    res.render('main', model);
});

app.get('/secured', (req, res) => {

    if (!req.oidc.isAuthenticated()) {
        res.send('You are not authorized to view this page.');
        return;
    }

    res.render('secured', {layout: 'index'});
});

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});

app.listen(port, () => console.log(`App listening on port ${port}`));

function getPageModel(req) {

    if (!req.oidc.isAuthenticated()) {
        return {isLoggedIn: false};
    }

    return {
        isLoggedIn: req.oidc.isAuthenticated(),
        userEmail: req.oidc.user.email
    };
}
