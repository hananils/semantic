import { Formatters } from './formatters.js';
import { Cursor } from './cursor.js';

import './formatters/block.blockcode.js';
import './formatters/block.blockquote.js';
import './formatters/block.empty.js';
import './formatters/block.heading.js';
import './formatters/block.orderedlist.js';
import './formatters/block.paragraph.js';
import './formatters/block.ruler.js';
import './formatters/block.unorderedlist.js';

import './formatters/inline.strong.js';
import './formatters/inline.emphasis.js';
import './formatters/inline.code.js';
import './formatters/inline.kirbytag.js';
import './formatters/inline.reference.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

export default class Semantic {
    constructor(editor) {
        this.editor = editor;
        this.cursor = new Cursor(this.editor);
        this.formatters = new Formatters();

        this.position = null;
        this.flag = false;

        // Parse document
        this.parse();

        // Watch for changes
        this.options = {
            characterData: true,
            childList: true,
            subtree: true
        };
        this.observer = new MutationObserver(this.process.bind(this));
        this.observer.observe(this.editor, this.options);

        // Events
        this.editor.addEventListener('click', this.handleClick.bind(this));
        this.editor.addEventListener('keydown', this.handleKeyup.bind(this));
        this.editor.addEventListener('paste', this.handlePaste.bind(this));
    }

    /**
     * Events
     */

    handleClick({ target, layerX }) {
        if (target.dataset.type === 'empty' && layerX < 25) {
            let empty = document.createElement('div');
            let prevs = this.countEmptyNeighbor(target, 'prev');
            let nexts = this.countEmptyNeighbor(target, 'next');

            this.format(empty, false);

            if (!prevs && nexts < 2) {
                target.parentNode.insertBefore(empty.cloneNode(true), target);
            }
            if (!nexts && prevs < 2) {
                target.parentNode.insertBefore(
                    empty.cloneNode(true),
                    target.nextElementSibling
                );
            }

            if (nexts === 2) {
                target = target.nextElementSibling;
            }
            if (prevs === 2) {
                target = target.previousElementSibling;
            }

            this.cursor.caret(target);
        }
    }

    countEmptyNeighbor(node, direction = 'prev') {
        let siblings = [];
        let sibling;

        if (direction === 'prev') {
            sibling = 'previousElementSibling';
        } else {
            sibling = 'nextElementSibling';
        }

        let i = 0;
        while (i < 2 && node[sibling]) {
            node = node[sibling];

            if (node.dataset.type === 'empty') {
                siblings.push(node[sibling]);
            } else {
                break;
            }

            i++;
        }

        return siblings.length;
    }

    handleKeyup({ code }) {
        /**
         * These flag have to be unset after the update circle has finished.
         */
        if (code === 'Enter' || code === 'Backspace') {
            this.flag = code;
        }
    }

    handlePaste(event) {
        let pasted = event.clipboardData.getData('text');
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);

        selection.deleteFromDocument();

        if (pasted) {
            let length = pasted.length;
            let block = event.target.closest('div');
            let { position } = this.cursor.get();
            let offset = Array.from(block.parentNode.children).indexOf(block);
            let content = '';

            this.editor.childNodes.forEach(function(node) {
                content += node.textContent + '\n';
            });

            let begin = content.substring(0, position + offset);
            let end = content.substring(position + offset, content.length);

            if (/\n/.test(pasted)) {
                pasted += '\n';
            }

            this.editor.textContent = begin + pasted + end;
            this.parse();
            this.cursor.set(position + pasted.length + offset);
        }

        event.preventDefault();
    }

    /**
     * Create
     */

    parse() {
        let blocks = this.editor.textContent.split(/\n/);

        this.clear();
        blocks.forEach(this.write, this);
    }

    write(block) {
        const wrapper = document.createElement('div');
        wrapper.textContent = block;

        this.format(wrapper);
        this.editor.appendChild(wrapper);
    }

    clear() {
        while (this.editor.firstChild) {
            this.editor.removeChild(this.editor.firstChild);
        }
    }

    /**
     * Process
     */

    process(changes, observer) {
        this.observer.disconnect();

        let changed = this.getChanged(changes);
        let cursor = this.cursor.get();

        // Format block
        this.setContext(changed, cursor);
        changed.forEach(this.format.bind(this));

        // Update next block
        if (this.flag === 'Enter' && changed.length > 1) {
            let type = this.formatters.getType(changed[1].dataset.type);

            if (type) {
                this.node = changed[0].childNodes[0];
                this.position = type.enter(changed[1], changed[0]);
            }
        }

        // Set cursor
        this.cursor.set(cursor.position, this.node);

        // Done
        this.flag = false;
        this.node = null;
        this.position = null;

        this.observer.observe(this.editor, this.options);
    }

    getChanged(changes) {
        let changed = [];

        changes.forEach(function({ target }) {
            if (target.nodeType === 1 && target.matches('.semantic-editor')) {
                return;
            } else if (target.nodeType === 3) {
                if (target.parentNode && !target.parentNode.matches('div')) {
                    target = target.parentNode.closest('div');
                } else {
                    target = target.parentNode;
                }
            }

            if (target && changed.indexOf(target) === -1) {
                changed.push(target);
            }
        });

        return changed;
    }

    setContext(changed, cursor) {
        /**
         * Store current context node when the user hits enter or backspace.
         * This will always return two changed nodes unless enter is hit at the
         * very end of an paragraph.
         */
        if (changed.length > 1) {
            switch (this.flag) {
                case 'Enter':
                    this.node = changed[0];
                    break;
                case 'Backspace':
                    this.node = changed[1];
                    break;
            }
        } else if (this.flag === 'Enter') {
            this.node = cursor.node;
        }

        this.position = cursor.position;
    }

    format(block) {
        this.formatters.parse(block);
        this.formatters.format(block);
    }
}
