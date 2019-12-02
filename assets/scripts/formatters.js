/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

/**
 * Types
 */

let types = {
    first: [],
    default: [],
    last: []
};

function registerType(Type, precedence = 'default') {
    if (!Type) {
        return false;
    }

    types[precedence].push(new Type());

    return true;
}

/**
 * Formats
 */

let formats = [];

function registerFormat(format) {
    if (!format) {
        return false;
    }

    formats.push(format);

    return true;
}

/**
 * Formatters
 */

class Formatters {
    constructor() {
        this.blockcode = false;
    }

    getType(name) {
        let block;

        Object.keys(types).some(function(precedence) {
            return types[precedence].some(function(type) {
                if (type.name() === name) {
                    block = type;
                    return true;
                }
            });
        });

        return block;
    }

    parse(block) {
        let content = block.textContent;
        let current = block.dataset.type;
        let blockcode = this.blockcode;
        let parser;

        Object.keys(types).some(function(precedence) {
            return types[precedence].some(function(type) {
                const matched = type.matches(content, block);

                if (matched === true && type !== current) {
                    if (type.constructor.name === 'Blockcode') {
                        blockcode = !blockcode;
                    }

                    if (blockcode === true) {
                        parser = types.default.filter(function(test) {
                            return test.constructor.name === 'Blockcode';
                        })[0];
                    } else {
                        parser = type;
                    }
                }

                return matched;
            });
        });

        parser.parse(content, block);
        this.blockcode = blockcode;
    }

    format(block) {
        let content = block.textContent;

        if (!content) {
            return;
        }

        formats.forEach(function(format) {
            content = format(content, block);
        });

        block.innerHTML = content;
    }
}

export { registerType, registerFormat, Formatters };
