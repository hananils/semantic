import { Formatters } from './formatters.js';

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
        this.formatters = new Formatters();

        /**
         * Set a flag if the user hits special keys in order to set the correct
         * range context when restoring the caret position.
         */
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

    handleClick(event) {
        if (event.target.dataset.type === 'empty') {
            console.log('click', event);
        }
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
            let position = this.getCaret();
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
            console.log(position, pasted.length);
            this.setCaret(position + pasted.length + offset);
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

        /**
         * Make sure the caret position is not calculated when initially
         * loading the editor by setting false.
         */
        this.format(wrapper, false);

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
        changed.forEach(this.format.bind(this));

        /**
         * After the update circle is completed, unset all flags needed
         * to correctly position the caret.
         */
        this.flag = false;
        this.node = null;

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

        /**
         * If the user hit enter inside a paragraph or backspace at the
         * beginning of a paragraph, there will be two blocks marked as changed.
         * This stores the correct context node for caret positioning.
         */
        if (changed.length > 1) {
            if (this.flag === 'Enter') {
                this.node = changed[0];
            } else if (this.flag === 'Backspace') {
                this.node = changed[1];
            }
        }

        return changed;
    }

    /**
     * Format
     */

    format(block, caret) {
        let position;

        if (caret !== false) {
            position = this.getCaret();
        }

        this.formatters.parse(block);

        if (block.dataset.type !== 'empty') {
            this.formatters.format(block);
        }

        if (position) {
            this.setCaret(position);
        }
    }

    /**
     * Caret
     *
     * The caret position needs to be stored before formatting a block and
     * to be restored afterwards. Since this always requires user input we
     * always deal with single point selection where start and end coincide.
     */
    getCaret() {
        let range = window.getSelection().getRangeAt(0);
        let container = range.startContainer;
        let offset = range.startOffset;

        range.selectNodeContents(this.editor);
        range.setEnd(container, offset);

        /**
         * If the user hits the enter key and no context node has been saved yet,
         * make sure the caret will be positioned inside this node after updating.
         * This concerns multiple consecutive empty lines.
         */
        if (this.flag !== false && !this.node) {
            this.node = container;
        }

        return range.toString().length;
    }

    setCaret(position) {
        let range = document.createRange();
        let count = 0;
        let nodes = [this.editor];
        let node;

        range.setStart(this.editor, 0);
        range.collapse(true);

        /**
         * Set the caret to the given context node if the user hit the enter key.
         */
        if (this.flag !== false && this.node) {
            range.setStart(this.node, 0);
        } else {
            /**
             * Parse all text nodes to find the correct caret position.
             */
            while ((node = nodes.pop())) {
                // Textnode
                if (node.nodeType === 3) {
                    let next = count + node.length;

                    if (count <= position && position <= next) {
                        range.setStart(node, position - count);

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

        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
