const {RECORD_TYPES} = require('../constants');
const {DateTime} = require("luxon");
const {optionFromList, optionFromFirstListRecord} = require('./utils/option');

class EventData {

}

EventData.createGetFutureEventsQuery = now => {
    return async container => {
        const querySpec = {
            query:
                'SELECT * from c ' +
                'WHERE c.recordType = @recordType and c.eventDate >= @eventDate',
            parameters: [
                {name: '@recordType', value: RECORD_TYPES.EVENT},
                {name: '@eventDate', value: now}
            ]
        };

        const {resources: events} = await container.items
            .query(querySpec)
            .fetchAll();

        return optionFromList(events);
    }
}

EventData.createGetEventByIdQuery = id => {
    return async container => {
        const querySpec = {
            query: 'SELECT * from c WHERE c.recordType = @recordType and c.id = @id',
            parameters: [
                {name: '@recordType', value: RECORD_TYPES.EVENT},
                {name: '@id', value: id}
            ]
        };

        const {resources: events} = await container.items
            .query(querySpec)
            .fetchAll();

        return optionFromFirstListRecord(events);
    }
}

EventData.createNewEvent = () => {
    return {
        recordType: RECORD_TYPES.EVENT,
        eventName: '',
        description: '',
        eventDate: DateTime.local().toUTC().toISO()
    };
};

module.exports = EventData;