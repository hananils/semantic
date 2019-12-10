import { getFormats, getSticky, getTypes } from './register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

/**
 * Formatters
 */

class Formatters {
    constructor(editor) {
        this.editor = editor;
        this.types = getTypes();
        this.formats = getFormats();
        this.sticky = getSticky();
    }

    unstick() {
        Object.keys(this.sticky).forEach(function(name) {
            this.sticky[name] = false;
        }, this);
    }

    parse(block) {
        let current = block.dataset.type;

        if (current && Object.keys(this.sticky).indexOf(current) > -1) {
            this.typecaseAll();
        } else {
            let type = this.typecast(block);

            if (Object.keys(this.sticky).indexOf(type) > -1) {
                this.typecaseAll();
            }
        }
    }

    typecaseAll() {
        this.unstick();
        this.editor.childNodes.forEach(this.typecast, this);
        this.unstick();
    }

    typecast(block) {
        let content = block.textContent;
        let types = this.types.entries();
        let parser = null;
        let name = null;
        let type;

        while (!parser && (type = types.next().value)) {
            if (type[1].matches(content, block)) {
                name = type[0];
                parser = type[1];

                // Flag sticky type
                if (Object.keys(this.sticky).indexOf(name) > -1) {
                    this.sticky[name] = !this.sticky[name];
                }
            }
        }

        Object.keys(this.sticky).some(
            function(name) {
                if (this.sticky[name] === true) {
                    parser = this.types.get(name);
                }
            }.bind(this)
        );

        if (parser) {
            parser.parse(content, block);
        }

        return name;
    }

    format(content) {
        if (!content) {
            return;
        }

        this.formats.forEach(function(format) {
            content = format(content);
        });

        return content;
    }

    getType(name) {
        return this.types.get(name);
    }
}

export { Formatters };
