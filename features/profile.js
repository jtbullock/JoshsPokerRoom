const configManager = require('../config-manager');
const userData = require('../data/users');

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class InvalidInviteCodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidInviteCodeError';
    }

}

async function upsertProfile(container, request, userRecord)
{
    if(!isProfileUpdateRequestValid(request))
    {
        throw new ValidationError("Request data invalid");
    }

    if(!userRecord.isActivated && !isInviteCodeValid(request)) {
        throw new InvalidInviteCodeError("Invite code is invalid");
    }

    const requestData = request.body;
    userRecord.fullName = requestData.fullName;
    userRecord.pokerStarsAccountName = requestData.pokerStarsAccountName;
    userRecord.payoutMethod = requestData.payoutMethod;
    userRecord.payoutId = requestData.payoutId;

    userRecord.isActivated = true;

    const {statusCode} = await container.items.upsert(userRecord);

    return {
        wasSuccessful: statusCode === 201,
        updatedRecord: userRecord
    };
}

function isProfileUpdateRequestValid(request)
{
    const requestData = request.body;
    return !!requestData.fullName.trim() && !!requestData.pokerStarsAccountName.trim();
}

function isInviteCodeValid(request)
{
    const inviteCodes = configManager.config.inviteCodes;
    const {inviteCode} = request.body;

    return !!inviteCode.trim() && inviteCodes.includes(inviteCode);
}

module.exports = {upsertProfile, ValidationError, InvalidInviteCodeError};