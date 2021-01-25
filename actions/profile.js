const userData = require('../data/users');
const profilePageModel = require('../page-models/profile-page-model');
const {MESSAGE_TYPES} = require('../constants');
const {addNotificationToModel, createMessage} = require('../page-models/notifications');
const config = require('config');

function get(container) {
    return async (req, res) => {
        try {
            const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
            const user = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);
            const model = profilePageModel(user, req.basePageModel);
            res.render('profile', model);
        } catch {
            const errorMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                'We\'re sorry, but there was a problem fetching your profile.');
            addNotificationToModel(req.basePageModel, errorMessage);
            res.render('main', req.basePageModel);
        }
    }
}

function save(container) {
    return async (req, res) => {
        const userQueryResult = await userData.createGetUserQuery(req.userEmail)(container);
        const userRecord = userQueryResult.wasFound ? userQueryResult.data : userData.createNewUser(req.userEmail);

        if(!isProfileRequestValid(req))
        {
            let model = profilePageModel(userRecord, req.basePageModel);

            const validationMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                'Please complete all required fields.');
            addNotificationToModel(model, validationMessage);

            res.render('profile', model);
            return;
        }

        const requestData = req.body;
        userRecord.fullName = requestData.fullName;
        userRecord.pokerStarsAccountName = requestData.pokerStarsAccountName;
        userRecord.payoutMethod = requestData.payoutMethod;
        userRecord.payoutId = requestData.payoutId;

        if(!userRecord.isActivated)
        {
            const inviteCodes = config.get('inviteCodes');
            const {inviteCode} = req.body;

            if(!inviteCode.trim() || !inviteCodes.includes(inviteCode))
            {
                let model = profilePageModel(userRecord, req.basePageModel);

                const validationMessage = createMessage(MESSAGE_TYPES.ERROR, 'Error',
                    'Please enter a valid invite code.');
                addNotificationToModel(model, validationMessage);

                res.render('profile', model);
                return;
            }

            userRecord.isActivated = true;
        }

        const {resource: upsertedUser} = await container.items.upsert(userRecord);

        let model = profilePageModel(upsertedUser, req.basePageModel);

        const successMessage = createMessage(MESSAGE_TYPES.SUCCESS, 'Success',
            'Your profile has been updated.');
        addNotificationToModel(model, successMessage);

        res.render('profile', model);
    }
}

function isProfileRequestValid(req) {
    const requestData = req.body;
    return !!requestData.fullName.trim() && !!requestData.pokerStarsAccountName.trim();
}

module.exports = {get, save};