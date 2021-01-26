const eventData = require('../data/events');
const userData = require('../data/users');
const {DateTime} = require('luxon');
const {addNotificationToModel, createMessage} = require('../page-models/notifications');
const {MESSAGE_TYPES} = require('../constants');
const registrationData = require('../data/registrations');
const {upsertProfile, ValidationError, InvalidInviteCodeError} = require('../features/profile');
const {saveLogic: profileSaveLogic} = require('../actions/profile');

function getRegistrationFormForEvent(container) {
    return async (req, res) => {
        const eventQueryResult = await eventData.createGetEventByIdQuery(req.params.id)(container);

        if (!eventQueryResult.wasFound) {
            res.redirect('/poker-room');
            return;
        }

        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const event = eventQueryResult.data;

        const model = {
            ...req.basePageModel('poker-room'),
            event: {
                eventDate: DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATETIME_FULL),
                eventName: event.eventName,
                id: event.id
            },
            ...userQueryResult.data
        };

        res.render('poker-room/register', model);
    };
}

function register(container) {
    return async (req, res) => {
        const profileSaveResult = await profileSaveLogic('poker-room/register', container,false)(req, res);

        if(!profileSaveResult.wasSuccessful) return;

        const eventQueryResult = await eventData.createGetEventByIdQuery(req.params.id)(container);

        if (!eventQueryResult.wasFound) {
            res.redirect('/');
        }

        const newRegistration = registrationData.createNewRegistration(profileSaveResult.updatedRecord, eventQueryResult.data);

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
            ...req.basePageModel('poker-room'),
            event: {
                eventDate: DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATETIME_FULL),
                eventName: event.eventName,
            },
        };

        addNotificationToModel(model, message);

        res.render('poker-room/register_success', model);
    }
}

module.exports = {getRegistrationFormForEvent, register};