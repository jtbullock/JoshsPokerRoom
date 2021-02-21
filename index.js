const express = require('express');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const configManager = require('./config-manager');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const bodyParser = require('body-parser');
const {injectBasePageModel, injectUserProfile} = require('./middleware');
const actions = require('./actions');

/**** LOAD CONFIG ****/
configManager.loadConfig();

/*** CREATE EXPRESS APP ****/
const app = express();
const port = process.env.PORT || 3000;

/**** SETUP COSMOS ****/
const {endpoint, key, databaseId, containerId} = configManager.config.cosmos;

const client = new CosmosClient({endpoint, key});

const database = client.database(databaseId);
const container = database.container(containerId);

/**** SETUP AUTH ****/
app.use(auth(configManager.config.auth));

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
app.get('/', (req, res) => res.render('main'));

app.get('/poker-room/login', (req, res) => res.oidc.login({ returnTo: '/poker-room' }));

app.get('/games/among-us', (req, res) => res.render('games/among-us'));
app.get('/games/jackbox', (req, res) => res.render('games/jackbox'));
app.get('/games/canasta', (req, res) => res.render('games/canasta', {layout:'minimal'}));

app.get('/poker-room', actions.main(container));
app.get('/poker-room/tournament', (req, res) =>
    res.render('poker-room/tournament', req.basePageModel('poker-room')))
app.get('/poker-room/pokerstars-setup', (req, res) =>
    res.render('poker-room/pokerstars-setup', req.basePageModel('poker-room')))
app.get('/poker-room/payout-structure', (req, res) =>
    res.render('poker-room/payout-structure', req.basePageModel('poker-room')))

app.get('/poker-room/profile', requiresAuth(), actions.profile.get(container));
app.post('/poker-room/profile', requiresAuth(), actions.profile.save(container));

app.get('/admin/event/create', requiresAuth(), actions.admin.getCreateEventForm(container));
app.post('/admin/event/create', requiresAuth(), actions.admin.createEvent(container));

app.get('/poker-room/register/:id', requiresAuth(), actions.register.getRegistrationFormForEvent(container));
app.post('/poker-room/register/:id', requiresAuth(), actions.register.register(container));

app.listen(port, () => console.log(`App listening on port ${port}`));
