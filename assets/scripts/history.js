import { toString } from './utilities.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

export class History {
    constructor(editor, cursor, max = 100) {
        this.editor = editor;
        this.cursor = cursor;
        this.max = max;
        this.history = {};

        this.editor.addEventListener('click', this.init.bind(this));
        this.editor.addEventListener('keydown', this.init.bind(this));
        this.editor.addEventListener('focus', this.init.bind(this));
        this.editor.addEventListener('input', this.set.bind(this));
    }

    init() {
        if (this.history.current) {
            return;
        }

        this.history = {
            backwards: [],
            current: [
                {
                    content: toString(this.editor),
                    position: this.cursor.position('block'),
                    index: this.cursor.blockindex()
                }
            ],
            forwards: []
        };
    }

    set() {
        let position = this.cursor.position('block');
        let index = this.cursor.blockindex();
        let content = toString(this.editor);

        this.append({
            content: content,
            position: position,
            index: index
        });
    }

    append(snapshot) {
        this.history.backwards.push(this.history.current.pop());
        this.history.current.push(snapshot);

        if (this.history.backwards.length > this.max) {
            this.history.backwards.shift();
        }
        if (this.history.forwards.length > this.max) {
            this.history.forwards.shift();
        }

        return snapshot;
    }

    backwards() {
        if (this.history.backwards.length) {
            let current = this.history.current.pop();
            let prev = this.history.backwards.pop();

            this.history.current.push(prev);
            this.history.forwards.push(current);

            return prev;
        }

        return null;
    }

    forwards() {
        if (this.history.forwards.length) {
            let current = this.history.current.pop();
            let next = this.history.forwards.pop();

            this.history.current.push(next);
            this.history.backwards.push(current);

            return next;
        }

        return null;
    }
}
