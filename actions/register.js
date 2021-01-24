const eventData = require('../data/events');
const userData = require('../data/users');
const {DateTime} = require('luxon');
const {addNotificationToModel, createMessage} = require('../page-models/notifications');
const {MESSAGE_TYPES} = require('../constants');
const registrationData = require('../data/registrations');

function getRegistrationFormForEvent(container) {
    return async (req, res) => {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const eventQueryResult = await eventData.createGetEventByIdQuery(req.params.id)(container);

        if (!userQueryResult.wasFound || !eventQueryResult.wasFound) {
            res.redirect('/');
        }

        const event = eventQueryResult.data;

        const model = {
            ...req.basePageModel,
            event: {
                eventDate: DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATETIME_FULL),
                eventName: event.eventName,
                id: event.id
            },
            user: userQueryResult.data
        };

        res.render('register', model);
    };
}

function register(container) {
    return async (req, res) => {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const eventQueryResult = await eventData.createGetEventByIdQuery(req.params.id)(container);

        if (!userQueryResult.wasFound || !eventQueryResult.wasFound) {
            res.redirect('/');
        }

        const newRegistration = registrationData.createNewRegistration(userQueryResult.data, eventQueryResult.data);

        const {statusCode} = await container.items.upsert(newRegistration);

        let message;

        if (statusCode === 201) {
            message = createMessage(MESSAGE_TYPES.SUCCESS, 'Success',
                `Your registration is complete!`);
        } else {
            message = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                `Failed to create registration.`);
        }

        const event = eventQueryResult.data;

        const model = {
            ...req.basePageModel,
            event: {
                eventDate: DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATETIME_FULL),
                eventName: event.eventName,
            },
        };

        addNotificationToModel(model, message);

        res.render('register_success', model);
    }
}

module.exports = {getRegistrationFormForEvent, register};