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
        this.flags = '';
    }

    isSticky(type) {
        return Object.keys(this.sticky).indexOf(type) > -1;
    }

    stick(type) {
        if (this.flags === type) {
            this.unstick();
        } else {
            this.flags = type;
        }
    }

    unstick() {
        this.flags = '';
    }

    parse(block) {
        let current = block.dataset.type;

        if (current && this.isSticky(current)) {
            this.typecaseAll();
        } else {
            let type = this.typecast(block);

            if (this.isSticky(type)) {
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
        let name, value, type;

        while (!parser && (value = types.next().value)) {
            [name, type] = value;
            if (type.matches(content, block)) {
                parser = type;

                // Flag sticky type
                if (this.isSticky(name)) {
                    this.stick(name);
                }
            }
        }

        if (this.flags) {
            parser = this.types.get(this.flags);
        }

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
