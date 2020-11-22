const express = require('express');
const handlebars = require('express-handlebars');
const {auth, requiresAuth} = require('express-openid-connect');
const config = require('config');
const CosmosClient = require("@azure/cosmos").CosmosClient;
const bodyParser = require('body-parser');

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
    extname: 'hbs'
}));

app.use(express.static('public'));

/**** ROUTES ****/
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

    res.render('profile', {layout: 'index'});
    // res.send(JSON.stringify(req.oidc.user));
});

app.post('/profile', requiresAuth(), async (req, res) => {
    const querySpec = {
        query: 'SELECT * from c WHERE c.email = @email',
        parameters: [
            {
                name: '@email',
                value:req.oidc.user.email
            }
        ]
    };

    const {resources: items} = await container.items
        .query(querySpec)
        .fetchAll();

    if (items.length > 0) {
        console.log('Existing record, updating...');

        const existingRecord = items[0];

        const updatedRecord = {
            ...existingRecord,
            fullName: req.body.fullName,
            pokerStarsAccountName: req.body.pokerStarsAccountName,
            payoutMethod: req.body.payoutMethod,
            payoutId: req.body.payoutId
        };

        const {resource: updatedItem} = await container.items.upsert(updatedRecord);

        console.log('Record updated...');
        console.dir(updatedItem);

    } else {
        console.log('New record, creating...');

        const newProfile = {
            fullName: req.body.fullName,
            pokerStarsAccountName: req.body.pokerStarsAccountName,
            payoutMethod: req.body.payoutMethod,
            payoutId: req.body.payoutId,
            email: req.oidc.user.email
        };

        const {resource: createdItem} = await container.items.create(newProfile);

        console.log('Created new profile record...');
        console.dir(createdItem);
    }

    res.render('profile', {layout: 'index'});
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
