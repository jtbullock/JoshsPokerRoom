const express = require('express');
const handlebars = require('express-handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const config = require('config');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const bodyParser = require('body-parser');
const userData = require('./data/users');
const {injectBasePageModel, injectUserProfile} = require('./middleware');
const profilePageModel = require('./page-models/profile-page-model');
const {addNotificationToModel, createMessage} = require('./page-models/notifications');

const app = express();
const port = 3000;

/**** SETUP COSMOS ****/
const {endpoint, key, databaseId, containerId} = config.get('cosmos');

const client = new CosmosClient({endpoint, key});

const database = client.database(databaseId);
const container = database.container(containerId);

/**** SETUP AUTH ****/
app.use(auth(config.get('auth')));

/**** SETUP BODY PARSER ****/
app.use(bodyParser.urlencoded({extended: true}));

/**** SETUP VIEW ENGINE ****/
app.set('view engine', 'hbs');

app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    helpers: require('./handlebars-helpers')
}));

app.use(express.static('public'));

/**** CUSTOM MIDDLEWARE ****/
app.use(injectUserProfile);
app.use(injectBasePageModel);

/**** ROUTES ****/
app.get('/', (req, res) => {
    res.render('main', req.basePageModel);
});

app.get('/profile', requiresAuth(), async (req, res) => {
    const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
    const user = userQueryResult.wasFound ? userQueryResult.data : userData.createEmptyUser();
    res.render('profile', profilePageModel(user, req.basePageModel));
});

app.post('/profile', requiresAuth(), async (req, res) => {
    const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
    const userRecord = userQueryResult.wasFound ? userQueryResult.data : userData.createEmptyUser();

    const requestData = req.body;
    userRecord.fullName = requestData.fullName;
    userRecord.pokerStarsAccountName = requestData.pokerStarsAccountName;
    userRecord.payoutMethod = requestData.payoutMethod;
    userRecord.payoutId = requestData.payoutId;

    const {resource: upsertedUser} = await container.items.upsert(userRecord);

    let model = profilePageModel(upsertedUser, req.basePageModel);
    const successMessage = createMessage('success', 'Success', 'Your profile has been updated.');
    addNotificationToModel(model, successMessage);

    res.render('profile', model);
});

app.listen(port, () => console.log(`App listening on port ${port}`));

/**** HELPERS ****/
function getPageModel(req) {

    if (!req.oidc.isAuthenticated()) {
        return {isLoggedIn: false};
    }

    return {
        isLoggedIn: req.oidc.isAuthenticated(),
        userEmail: req.oidc.user.email
    };
}
