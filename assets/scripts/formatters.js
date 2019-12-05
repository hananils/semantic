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
    last: [],
    all: [],
    named: []
};

function registerType(Type, precedence = 'default') {
    if (!Type) {
        return false;
    }

    let type = new Type();

    types[precedence].push(type);
    types['all'] = [...types.first, ...types.default, ...types.last];
    types['named'][type.constructor.name.toLowerCase()] = type;

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
    parse(block) {
        let content = block.textContent;
        let current = block.dataset.type;
        let blockcode = this.blockcode;
        let parser;

        types.all.some(function(type) {
            if (type.matches(content, block)) {
                parser = type;
                return true;
            }

            return false;
        });

        if (parser) {
            parser.parse(content, block);
            console.log(
                'set type',
                parser.constructor.name.toLowerCase(),
                block
            );
        }
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
