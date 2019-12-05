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
    container() {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        let container = range.startContainer;

        return container;
    }

    get(node) {
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);
        let container = range.startContainer;
        let offset = range.startOffset;
        let position;

        range.setStart(node, 0);
        range.setEnd(container, offset);

        position = range.toString().length;
        range.setStart(container, offset);

        return position;
    }

    find(position, context) {
        let count = 0;
        let nodes = [context];
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

        range.collapse(true);
        range.setStart(node, position);

        selection.removeAllRanges();
        selection.addRange(range);
    }
}
