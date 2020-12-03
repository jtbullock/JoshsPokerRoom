const {RECORD_TYPES} = require('../constants');
const {DateTime} = require("luxon");

class RegistrationData {

}

RegistrationData.createNewRegistration = (user, eventId) => {
    return {
        recordType: RECORD_TYPES.REGISTRATION,
        user,
        eventId,
        registeredDate: DateTime.local().toUTC().toISO()
    };
};

module.exports = RegistrationData;