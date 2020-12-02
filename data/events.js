const {RECORD_TYPES} = require('../constants');

class EventData {

}

EventData.createGetEventsQuery = (now) => {
    return async (container) => {
        const querySpec = {
            query: 'SELECT * from c WHERE c.recordType = @recordType and c.eventDate >= @eventDate',
            parameters: [
                {name: '@recordType', value: RECORD_TYPES.EVENT},
                {name: '@eventDate', value: now}
            ]
        };

        const {resources: events} = await container.items
            .query(querySpec)
            .fetchAll();

        if (events.length === 0) {
            return {wasFound: false};
        }

        return {
            wasFound: true,
            data: events
        };
    }
}

EventData.createNewEvent = () => {
    return {
        recordType: RECORD_TYPES.EVENT,
        eventName: '',
        description: '',
        eventDate: new Date().toISOString()
    };
};

module.exports = EventData;