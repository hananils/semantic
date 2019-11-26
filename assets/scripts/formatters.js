let formatters = {
    inline: [],
    block: []
};

function register(type, formatter) {
    if (!type || !formatter) {
        return;
    }

    formatters[type].push(formatter);
}

function get(type) {
    if (type) {
        return formatters[type];
    }

    return formatters;
}

export default { register, get };
