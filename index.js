const express = require('express');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const config = require('config');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const bodyParser = require('body-parser');
const userData = require('./data/users');
const {injectBasePageModel, injectUserProfile} = require('./middleware');
const profilePageModel = require('./page-models/profile-page-model');
const {addNotificationToModel, createMessage} = require('./page-models/notifications');
const {MESSAGE_TYPES, SITE_ROLES} = require('./constants');
const {hasRole} = require('./permission-checker');
const eventData = require('./data/events');
const {DateTime} = require("luxon");

/*** CREATE EXPRESS APP ****/
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

app.engine('hbs', expressHandlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs',
    handlebars: Handlebars,
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
    try {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const user = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);
        res.render('profile', profilePageModel(user, req.basePageModel));
    } catch {
        const errorMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
            'We\'re sorry, but there was a problem fetching your profile.');
        addNotificationToModel(req.basePageModel, errorMessage);
        res.render('main', req.basePageModel);
    }
});

app.post('/profile', requiresAuth(), async (req, res) => {
    const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
    const userRecord = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);

    const requestData = req.body;
    userRecord.fullName = requestData.fullName;
    userRecord.pokerStarsAccountName = requestData.pokerStarsAccountName;
    userRecord.payoutMethod = requestData.payoutMethod;
    userRecord.payoutId = requestData.payoutId;

    const {resource: upsertedUser} = await container.items.upsert(userRecord);

    let model = profilePageModel(upsertedUser, req.basePageModel);
    const successMessage = createMessage(MESSAGE_TYPES.SUCCESS, 'Success', 'Your profile has been updated.');
    addNotificationToModel(model, successMessage);

    res.render('profile', model);
});

app.get('/admin/event/create', requiresAuth(), async (req, res) => {
    const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);

    if (!hasRole(userQueryResult, SITE_ROLES.ADMIN)) {
        res.redirect('/');
    }

    res.render('admin/create-event', {...req.basePageModel, ...eventData.createNewEvent()});
})

app.post('/admin/event/create', requiresAuth(), async (req, res) => {
    const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);

    if (!hasRole(userQueryResult, SITE_ROLES.ADMIN)) {
        res.redirect('/');
    }

    const requestData = req.body;

    const isoDate = DateTime.fromISO(`${requestData.eventDate}T${requestData.eventTime}`,
        {zone: requestData.clientTimezone}).toUTC().toISO();

    console.log(isoDate);

    const newEvent = eventData.createNewEvent();
    newEvent.eventName = requestData.eventName;
    newEvent.description = requestData.description;
    newEvent.eventDate = isoDate;

    const {statusCode} = await container.items.upsert(newEvent);

    let message;

    if (statusCode === 201) {
        message = createMessage(MESSAGE_TYPES.SUCCESS, 'Success',
            `Event ${requestData.eventName} has been created.`);
    } else {
        message = createMessage(MESSAGE_TYPES.ERROR, 'Error',
            `Unable to create event ${requestData.eventName}.`);
    }

    addNotificationToModel(req.basePageModel, message);

    res.render('admin/create-event', req.basePageModel);
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
