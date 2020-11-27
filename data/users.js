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

UserData.createEmptyUser = () => {
    return {
        fullName: '',
        pokerStarsAccountName: '',
        payoutMethod: '',
        payoutId: '',
    };
};

module.exports = UserData;