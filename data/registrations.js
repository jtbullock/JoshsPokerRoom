const {RECORD_TYPES} = require('../constants');
const {DateTime} = require("luxon");
const {optionFromList} = require('./utils/option');

class RegistrationData {

}

RegistrationData.createGetFutureRegistrationsQuery = (now, email) => {
    return async container => {
        const querySpec = {
            query:
                'SELECT * from c ' +
                'WHERE c.recordType = @recordType ' +
                '   and c.user.email = @userEmail ' +
                '   and c.event.eventDate >= @dateNow',
            parameters: [
                {name: '@recordType', value: RECORD_TYPES.REGISTRATION},
                {name: '@userEmail', value: email},
                {name: '@dateNow', value: now}
            ]
        }

        const {resources: registrations} = await container.items
            .query(querySpec)
            .fetchAll();

        return optionFromList(registrations);
    }
};

RegistrationData.createNewRegistration = (user, event) => {
    return {
        recordType: RECORD_TYPES.REGISTRATION,
        user,
        event,
        registeredDate: DateTime.local().toUTC().toISO()
    };
};

module.exports = RegistrationData;