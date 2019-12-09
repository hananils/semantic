/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

/**
 * Types
 */

let types = {
    first: [],
    consecutive: [],
    default: [],
    last: [],
    all: [],
    named: {},
    flagged: {}
};

function registerType(Type, precedence = 'default') {
    if (!Type) {
        return false;
    }

    let type = new Type();
    let name = type.constructor.name.toLowerCase();

    types[precedence].push(type);
    types.all = [
        ...types.first,
        ...types.consecutive,
        ...types.default,
        ...types.last
    ];
    types.named[name] = type;

    if (precedence === 'consecutive') {
        types.flagged[name] = false;
    }

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
    parse(block, all = false) {
        let content = block.textContent;
        let current = block.dataset.type;
        let parser;

        if (!all && Object.keys(types.flagged).indexOf(current) > -1) {
            this.parseAll(block);
            return;
        }

        types.all.some(function(type) {
            if (type.matches(content, block)) {
                parser = type;

                let name = parser.name();

                if (Object.keys(types.flagged).indexOf(name) > -1) {
                    types.flagged[name] = !types.flagged[name];
                }

                return true;
            }

            return false;
        });

        if (types.consecutive.length) {
            Object.keys(types.flagged).some(function(name) {
                if (types.flagged[name] === true) {
                    parser = types.named[name];
                }
            });
        }

        if (parser) {
            parser.parse(content, block);
        }
    }

    parseAll(block) {
        let editor = block.closest('.semantic-editor');
        let blocks = editor.querySelectorAll('div[data-type]');

        Object.keys(types.flagged).forEach(function(flagged) {
            types.flagged[flagged] = false;
        });

        blocks.forEach(this.parse.bind(this));
    }

    format(content) {
        if (!content) {
            return;
        }

        formats.forEach(function(format) {
            content = format(content);
        });

        return content;
    }

    getType(name) {
        return types.named[name];
    }
}

export { registerType, registerFormat, Formatters };
