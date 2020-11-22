module.exports = {
    addNotificationToModel: (model, message) => {
        model.notifications = model.notifications ? [...model.notifications, message] : [message];
    },
    createMessage: (type, title, description) => {
        return {type, title, description};
    }
};