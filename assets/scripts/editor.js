import { Formatters } from './formatters.js';
import { Cursor } from './cursor.js';
import { History } from './history.js';
import { toBlock, toString } from './utilities.js';

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
        this.history = new History(this.editor, this.cursor);
        this.changed = null;

        // Parse document
        if (this.editor.textContent === '') {
            this.init();
        } else {
            this.parse();
        }

        // Watch for changes
        this.options = {
            characterData: true,
            childList: true,
            subtree: true
        };
        this.observer = new MutationObserver(this.process.bind(this));
        this.observer.observe(this.editor, this.options);

        // Events
        this.editor.addEventListener('input', this.handleInput.bind(this));
        this.editor.addEventListener('keydown', this.handleKeydown.bind(this));
        this.editor.addEventListener('keyup', this.handleKeyup.bind(this));
        this.editor.addEventListener('click', this.handleClick.bind(this));
        this.editor.addEventListener('paste', this.handlePaste.bind(this));
    }

    /**
     * Events
     */

    handleInput() {
        if (this.editor.textContent === '' && this.editor.children.length < 2) {
            this.init();
        }
    }

    handleKeydown(event) {
        if (event.metaKey || event.shiftKey) {
            let snapshot = null;

            if (event.key === 'z') {
                snapshot = this.history.backwards();
            } else if (event.key === 'y') {
                snapshot = this.history.forwards();
            }

            if (snapshot) {
                event.preventDefault();

                this.editor.textContent = snapshot.content;
                this.parse();
                this.cursor.find(this.editor, snapshot.position);
            }
        }

        if (this.editor.textContent === '') {
            this.cursor.set(this.editor.children[0], 0);
        }
    }

    handleKeyup(event) {
        let block = this.cursor.get('block');

        if (!document.body.contains(block)) {
            let container = this.cursor.get('container');

            let wrapper = document.createElement('div');

            this.editor.insertBefore(wrapper, container);
            wrapper.appendChild(container);

            this.formatters.parse(wrapper);
            this.format(wrapper);
        }
    }

    handleClick({ target, layerX }) {
        if (target.dataset.type === 'empty' && layerX < 25) {
            if (this.editor.children.length > 1) {
                let empty = document.createElement('div');
                let prevs = this.getCount(target, 'prev');
                let nexts = this.getCount(target, 'next');

                this.formatters.parse(empty);

                if (!prevs && nexts < 2) {
                    target.parentNode.insertBefore(
                        empty.cloneNode(true),
                        target
                    );
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
            }

            this.cursor.set(target);
        }
    }

    handlePaste(event) {
        let pasted = event.clipboardData.getData('text');
        let selection = window.getSelection();
        let range = selection.getRangeAt(0);

        selection.deleteFromDocument();

        if (pasted) {
            let block = this.cursor.get('block');
            let position = this.cursor.position('block');
            let content = block.textContent;
            let begin = content.substring(0, position);
            let end = content.substring(position, content.length);

            block.textContent = begin + pasted + end;

            this.format(block);
            this.cursor.find(block, position + pasted.length);
            this.history.set();
        }

        event.preventDefault();
    }

    /**
     * Create
     */

    parse() {
        let blocks = this.editor.textContent.split(/\n/);

        this.editor.innerHTML = '';
        blocks.forEach(this.write, this);
    }

    init() {
        const wrapper = document.createElement('div');

        this.formatters.parse(wrapper);
        wrapper.setAttribute('placeholder', 'Start typing');
        this.editor.innerHTML = '';
        this.editor.appendChild(wrapper);
    }

    write(block) {
        const wrapper = document.createElement('div');
        wrapper.textContent = block;

        this.formatters.parse(wrapper);
        this.format(wrapper);
        this.editor.appendChild(wrapper);
    }

    /**
     * Process
     */

    process(changes, observer) {
        this.observer.disconnect();

        let changed = this.getChanged(changes);
        this.selected = this.cursor.get('block');

        changed.forEach(function(block) {
            this.formatters.parse(block);
            this.format(block);
        }, this);

        if (changed.length === 2) {
            this.formatNew(...changed);
        }

        this.selected = null;
        this.observer.observe(this.editor, this.options);
    }

    format(block) {
        let content = block.textContent;

        if (!content) {
            return;
        }

        content = this.formatters.format(block.textContent);

        if (block.innerHTML !== content) {
            let position;

            if (block === this.selected) {
                position = this.cursor.position('block');
            }

            block.innerHTML = content;

            if (position) {
                this.cursor.find(block, position);
            }
        }
    }

    formatNew(created, current) {
        let type = this.formatters.getType(current.dataset.type);

        if (type) {
            let position = type.enter(current, created);

            this.cursor.find(created, position);
        }
    }

    /**
     * Utilities
     */

    getChanged(changes) {
        let changed = [];

        changes.forEach(function({ target }) {
            let node = toBlock(target);

            if (
                node &&
                changed.indexOf(node) === -1 &&
                document.body.contains(node)
            ) {
                changed.push(node);
            }
        }, this);

        return changed;
    }

    getCount(node, direction = 'prev', type = 'empty') {
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

            if (node.dataset.type === type) {
                siblings.push(node[sibling]);
            } else {
                break;
            }

            i++;
        }

        return siblings.length;
    }
}
