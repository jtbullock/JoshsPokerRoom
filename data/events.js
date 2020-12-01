const {RECORD_TYPES} = require('../constants');

class EventData {

}

EventData.createGetEventsQuery = () => {
    return async (container) => {
        const querySpec = {
            query: 'SELECT * from c WHERE c.recordType = @recordType AND c.eventDate'
        }
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