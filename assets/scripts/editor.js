import Formatters from './formatters.js';

import './formatters/block.heading.js';
import './formatters/block.unorderedlist.js';
import './formatters/block.orderedlist.js';
import './formatters/block.blockquote.js';
import './formatters/block.blockcode.js';

import './formatters/inline.strong.js';
import './formatters/inline.em.js';
import './formatters/inline.kirbytag.js';
import './formatters/inline.reference.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

export default class Semantic {
    constructor(editor) {
        this.editor = editor;
        this.blocks = [];
        this.enter = false;
        this.options = {
            characterData: true,
            childList: true,
            subtree: true
        };

        this.parse();
        // this.write();

        this.observer = new MutationObserver(this.process.bind(this));
        this.observer.observe(this.editor, this.options);

        // Events
        this.editor.addEventListener('keyup', this.handleInput.bind(this));
        this.editor.addEventListener('input', this.handleInput.bind(this));
    }

    register(name, type) {
        this.formatters[type] = name;
    }

    getFormatters() {
        return this.formatters;
    }

    /**
     * Events
     */

    handleInput({ code }) {
        if (code === 'Enter') {
            this.enter = true;
        }

        if (this.enter === true) {
            this.enter = false;
            this.editor.childNodes.forEach(this.formatBlock.bind(this));
        }
    }

    /**
     * Create
     */

    parse() {
        let blocks = this.editor.textContent.split(/\n/);

        this.clear();
        blocks.forEach(this.write.bind(this));

        blocks = this.editor.querySelectorAll('div');
        blocks.forEach(this.identify.bind(this));
    }

    write(block) {
        const wrapper = document.createElement('div');
        const br = document.createElement('br');

        if (block === '') {
            wrapper.appendChild(br.cloneNode());
            wrapper.classList.add('empty');
        } else {
            wrapper.textContent = block;
            wrapper.classList.add('paragraph');
            this.formatInlines(wrapper);
        }

        this.editor.appendChild(wrapper);
    }

    identify(block) {
        let formatters = Formatters.get('block');

        formatters.some(function(formatter) {
            return formatter(block.textContent, block);
        });
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
        observer.disconnect();

        let changed = this.getChanged(changes);
        changed.forEach(this.format.bind(this));

        observer.observe(this.editor, this.options);
    }

    getChanged(changes) {
        let changed = [];

        changes.forEach(function({ target }) {
            if (target.nodeType === 1 && target.matches('.semantic-editor')) {
                return;
            } else if (target.nodeType === 3) {
                if (!target.parentNode.matches('div')) {
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

    /**
     * Format
     */

    format(block) {
        let position = this.getCaret();

        block = this.formatBlock(block);
        block = this.formatInlines(block);

        this.setCaret(position);
    }

    formatBlock(block) {
        let content = block.textContent;

        if (content.trim() === '' && !block.childNodes.length) {
            let br = document.createElement('br');

            // block.innerHTML = '';
            delete block.dataset;
            block.className = '';
            block.classList.add('empty');
            block.appendChild(br.cloneNode());
        }

        return block;
    }

    formatInlines(block) {
        let formatters = Formatters.get('inline');
        let content = block.textContent;

        formatters.forEach(function(formatter) {
            content = formatter(content, block);
        });

        block.innerHTML = content;

        return block;
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

        return range.toString().length;
    }

    setCaret(position) {
        let range = document.createRange();
        let count = 0;
        let nodes = [this.editor];
        let node;

        range.setStart(this.editor, 0);
        range.collapse(true);

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

        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
