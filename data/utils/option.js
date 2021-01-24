function optionFromList(list)
{
    if (list.length === 0) {
        return {wasFound: false};
    }

    return {
        wasFound: true,
        data: list
    };
}

function optionFromFirstListRecord(list)
{
    if (list.length === 0) {
        return {wasFound: false};
    }

    return {
        wasFound: true,
        data: list[0]
    };
}

module.exports = {
    optionFromList,
    optionFromFirstListRecord
};