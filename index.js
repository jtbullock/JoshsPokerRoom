const express = require('express');
const expressHandlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const config = require('config');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const bodyParser = require('body-parser');
const {injectBasePageModel, injectUserProfile} = require('./middleware');
const actions = require('./actions');

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
    res.render('placeholder');
});

// app.get('/', actions.main(container));

// app.get('/profile', requiresAuth(), actions.profile.get(container));
// app.post('/profile', requiresAuth(), actions.profile.save(container));
//
// app.get('/admin/event/create', requiresAuth(), actions.admin.getCreateEventForm(container));
// app.post('/admin/event/create', requiresAuth(), actions.admin.createEvent(container));
//
// app.get('/register/:id', requiresAuth(), actions.register.getRegistrationFormForEvent(container));
// app.post('/register/:id', requiresAuth(), actions.register.register(container));

app.listen(port, () => console.log(`App listening on port ${port}`));
