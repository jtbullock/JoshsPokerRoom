module.exports = (user, basePageModel) => {
    return {
        ...basePageModel,
        fullName: user.fullName,
        pokerStarsAccountName: user.pokerStarsAccountName,
        payoutMethod: user.payoutMethod,
        payoutId: user.payoutId,
        isActivated: user.isActivated
    };
}