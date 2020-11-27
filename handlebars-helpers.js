const {MESSAGE_TYPES} = require('./constants');
const Handlebars = require('handlebars');

module.exports = {
    select: function (selected, options) {
        return options.fn(this).replace(
            new RegExp(' value=\"' + selected + '\"'),
            '$& selected="selected"');
    },
    messageIcon: function (messageType) {
        if (messageType === MESSAGE_TYPES.SUCCESS) {
            return new Handlebars.SafeString('<i class="fas fa-check-circle"></i>');
        } else if (messageType === MESSAGE_TYPES.ERROR) {
            return new Handlebars.SafeString('<i class="fas fa-times-circle"></i>');
        }

        return new Handlebars.SafeString('<i class="fas fa-exclamation-circle"></i>');
    }
};