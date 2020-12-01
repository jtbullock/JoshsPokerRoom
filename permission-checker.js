module.exports = {
    hasRole: (userQueryResult, role) => {
        if(!userQueryResult.wasFound) {
            return false;
        }

        if(userQueryResult.wasFound && !userQueryResult.data.roles.includes(role))
        {
            return false;
        }

        return true;
    }
}