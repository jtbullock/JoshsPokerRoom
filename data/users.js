const {RECORD_TYPES} = require('../constants');

class UserData {

}

UserData.createGetUserQuery = (email) => {
    return async (container) => {
        const querySpec = {
            query: 'SELECT * from c WHERE c.email = @email and c.recordType = @recordType',
            parameters: [
                {name: '@email', value: email},
                {name: '@recordType', value: RECORD_TYPES.USER}
            ]
        };

        const {resources: users} = await container.items
            .query(querySpec)
            .fetchAll();

        if (users.length === 0) {
            return {wasFound: false};
        }

        return {
            wasFound: true,
            data: users[0]
        };
    }
};

UserData.createNewUser = (email) => {
    return {
        email,
        fullName: '',
        pokerStarsAccountName: '',
        payoutMethod: '',
        payoutId: '',
        recordType: RECORD_TYPES.USER,
        roles: [],
        isActivated: false
    };
};

module.exports = UserData;