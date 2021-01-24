const main = require('./main');
const profile = require('./profile');
const admin = require('./admin');
const register = require('./register');

module.exports = {
    main: main.main,
    profile: {
        get: profile.get,
        save: profile.save
    },
    admin: {
        getCreateEventForm: admin.getCreateEventForm,
        createEvent: admin.createEvent
    },
    register: {
        getRegistrationFormForEvent: register.getRegistrationFormForEvent,
        register: register.register
    }
};