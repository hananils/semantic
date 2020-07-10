import { toBlock } from './utilities.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

/**
 * Cursor
 *
 * The cursor position needs to be stored before formatting a block and
 * to be restored afterwards. Since this always requires user input we
 * always deal with single point selection where start and end coincide.
 */

export class Cursor {
    constructor(editor) {
        this.editor = editor;
        this.block = null;
        this.container = null;
        this.index = null;
        this.positions = {
            editor: null,
            block: null
        };

        editor.addEventListener('focus', this.locate.bind(this));
        editor.addEventListener('click', this.locate.bind(this));
        editor.addEventListener('input', this.locate.bind(this));
    }

    locate() {
        if (this.editor !== document.activeElement) {
            this.block = null;
            this.container = null;
            this.index = null;
            this.positions.editor = null;
            this.positions.block = null;
        }

        let selection = window.getSelection();

        if (!selection.rangeCount) {
            return;
        }

        let range = selection.getRangeAt(0);
        let clone = range.cloneRange();
        let offset = clone.startOffset;

        this.container = clone.startContainer;
        this.block = toBlock(this.container);

        clone.setStart(this.editor, 0);
        clone.setEnd(this.container, offset);

        this.positions.editor = clone.toString().length;

        if (this.block) {
            clone.setStart(this.block, 0);

            this.positions.block = clone.toString().length;
            this.index = Array.from(this.editor.children).indexOf(this.block);
        }
    }

    get(context) {
        if (['block', 'container'].indexOf(context) > -1) {
            return this[context];
        }

        return this.editor;
    }

    position(context) {
        if (context === 'block') {
            return this.positions.block;
        }

        return this.positions.editor;
    }

    blockindex() {
        return this.index;
    }

    find(context, position = 0) {
        let count = 0;
        let nodes = [context];
        let node;

        while ((node = nodes.pop())) {
            // Textnode
            if (node.nodeType === 3) {
                let next = count + node.length;

                if (count <= position && position <= next) {
                    this.set(node, position - count);

                    break;
                }

                count = next;
            }

            // Collect children
            else {
                let i = node.childNodes.length;

                while (i--) {
                    nodes.push(node.childNodes[i]);
                }
            }
        }
    }

    set(context, position = 0) {
        let selection = window.getSelection();
        let range = document.createRange();

        if (!context) {
            context = this.editor;
        }

        range.setStart(context, position);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);

        this.locate();
    }
}
