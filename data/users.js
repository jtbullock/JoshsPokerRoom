class UserData {

}

UserData.createGetUserQuery = (email) => {
    return async (container) => {
        const querySpec = {
            query: 'SELECT * from c WHERE c.email = @email',
            parameters: [{name: '@email', value: email}]
        };

        const {resources: users} = await container.items
            .query(querySpec)
            .fetchAll();

        if(users.length === 0) {
            return { wasFound: false };
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