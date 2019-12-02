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
    constructor(editable) {
        this.editable = editable;
    }

    get() {
        let range = window.getSelection().getRangeAt(0);
        let container = range.startContainer;
        let offset = range.startOffset;
        let position;

        range.selectNodeContents(this.editable);
        range.setEnd(container, offset);

        position = range.toString().length;

        return {
            position: position,
            node: container
        };
    }

    set(position = 0, node = null) {
        if (node) {
            this.caret(node, 0);
        } else {
            this.find(position);
        }

        return true;
    }

    find(position) {
        let count = 0;
        let nodes = [this.editable];
        let node;

        while ((node = nodes.pop())) {
            // Textnode
            if (node.nodeType === 3) {
                let next = count + node.length;

                if (count <= position && position <= next) {
                    this.caret(node, position - count);

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

    caret(node, position = 0) {
        let range = document.createRange();
        let selection = window.getSelection();

        console.log(node, range.startOffset, position);

        range.collapse(true);
        range.setStart(node, position);

        selection.removeAllRanges();
        selection.addRange(range);
    }
}
