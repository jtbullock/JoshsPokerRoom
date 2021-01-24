const userData = require('../data/users');
const eventData = require('../data/events');
const {SITE_ROLES, MESSAGE_TYPES} = require('../constants');
const {hasRole} = require('../permission-checker');
const {addNotificationToModel, createMessage} = require('../page-models/notifications');
const {DateTime} = require('luxon');

function getCreateEventForm(container) {
    return async (req, res) => {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);

        if (!hasRole(userQueryResult, SITE_ROLES.ADMIN)) {
            res.redirect('/');
        }

        res.render('admin/create-event', {...req.basePageModel, ...eventData.createNewEvent()});
    };
}

function createEvent(container) {
    return async (req, res) => {
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
    };
}

module.exports = { getCreateEventForm, createEvent };