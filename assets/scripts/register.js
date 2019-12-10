/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

/**
 * Register
 */

let register = {
    types: {
        first: [],
        sticky: [],
        default: [],
        last: []
    },
    formats: new Map(),
    sticky: {}
};

/**
 * Types
 */

function registerType(Type, precedence = 'default') {
    if (!Type) {
        return false;
    }

    register.types[precedence].push(Type);

    return true;
}

function getTypes() {
    let types = new Map();
    let classes = [
        ...register.types.first,
        ...register.types.sticky,
        ...register.types.default,
        ...register.types.last
    ];

    classes.forEach(function(Type) {
        let type = new Type();
        let name = type.constructor.name.toLowerCase();

        types.set(name, type);

        if (register.types.sticky.indexOf(Type) > -1) {
            register.sticky[name] = false;
        }
    });

    return types;
}

function getSticky() {
    return register.sticky;
}

/**
 * Formats
 */

function registerFormat(name, formatter) {
    if (!name || !formatter) {
        return false;
    }

    register.formats.set(name, formatter);

    return true;
}

function getFormats() {
    return register.formats;
}

export { registerFormat, registerType, getFormats, getSticky, getTypes };
