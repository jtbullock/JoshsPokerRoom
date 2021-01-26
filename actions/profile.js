const userData = require('../data/users');
const profilePageModel = require('../page-models/profile-page-model');
const {MESSAGE_TYPES} = require('../constants');
const {addNotificationToModel, createMessage} = require('../page-models/notifications');
const configManager = require('../config-manager');
const {upsertProfile, ValidationError, InvalidInviteCodeError} = require('../features/profile');

function get(container) {
    return async (req, res) => {
        try {
            const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
            const user = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);
            const model = profilePageModel(user, req.basePageModel('poker-room'));
            res.render('poker-room/profile', model);
        } catch {
            const errorMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                'We\'re sorry, but there was a problem fetching your profile.');
            addNotificationToModel(req.basePageModel('poker-room'), errorMessage);
            res.render('poker-room/main', req.basePageModel('poker-room'));
        }
    }
}

function save(container) {
    return async (req, res) => {
        await saveLogic('poker-room/profile', container, true)(req, res);
    }
}

function saveLogic(view, container, shouldRenderSuccess) {
    return async (req, res) => {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const userRecord = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);

        try {
            await upsertProfile(container, req, userRecord);

            let model = profilePageModel({...req.body, isActivated: true}, req.basePageModel('poker-room'));

            const successMessage = createMessage(MESSAGE_TYPES.SUCCESS, 'Success',
                'Your profile has been updated.');
            addNotificationToModel(model, successMessage);

            if(shouldRenderSuccess)
            {
                res.render(view, model);
            }

            return {
                wasSuccessful: true,
                updatedRecord: userRecord
            };
        } catch (err) {
            let model = profilePageModel({...req.body, isActivated: userRecord.isActivated},
                req.basePageModel('poker-room'));
            let popupMessage;

            if (err instanceof ValidationError) {
                popupMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                    'Please complete all required fields.');
            } else if (err instanceof InvalidInviteCodeError) {
                popupMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                    'Please enter a valid invite code.');
            } else {
                popupMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                    'We\'re sorry, but an error has occurred.');
            }

            addNotificationToModel(model, popupMessage);
            res.render(view, model);

            return {
                wasSuccessful: false
            };
        }
    }
}

module.exports = {get, save, saveLogic};