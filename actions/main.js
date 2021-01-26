const {DateTime} = require('luxon');
const eventData = require('../data/events');
const registrationData = require('../data/registrations');

function main(container)
{
    return async (req, res) => {
        const now = DateTime.local().toUTC().toISO();

        const eventsQueryResult = await eventData.createGetFutureEventsQuery(now)(container);
        const registrationsQueryResult =
            await registrationData.createGetFutureRegistrationsQuery(now, req.userEmail)(container);

        let events = [];

        if (eventsQueryResult.wasFound) {
            events = eventsQueryResult.data.map(event => ({
                eventName: event.eventName,
                eventDate: DateTime.fromISO(event.eventDate).toLocaleString(DateTime.DATETIME_FULL),
                id: event.id,
                isRegistered: registrationsQueryResult.wasFound &&
                    !!registrationsQueryResult.data.find(r => r.event.id === event.id)
            }));
        }

        const model = {...req.basePageModel('poker-room'), hasEvents: eventsQueryResult.wasFound, events};

        res.render('poker-room/main', model);
    }
}

module.exports = {
    main
};