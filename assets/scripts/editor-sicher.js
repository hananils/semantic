import VanillaCaret from "./caret.js";

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

const editor = document.querySelector("#editor");
const output = document.querySelector("#output");
const options = {
    characterData: true,
    childList: true,
    subtree: true
};

let blocks = [];
let cursor;

/**
 * Title
 *
 * This script determines whether the page has been scrolled passed a threshold.
 * It is used to to apply a background colour to the title bar in order to
 * increase the contrast of the language switcher.
 */

function init() {
    if (!editor) {
        return;
    }

    console.log(VanillaCaret);

    cursor = new VanillaCaret(editor);

    parse();
    write();

    // Observers
    const observer = new MutationObserver(function(mutationsList) {
        let changed = [];

        mutationsList.forEach(function({ target }) {
            if (target.nodeType === 1 && target.matches("#editor")) {
                return;
            } else if (target.nodeType === 3) {
                if (!target.parentNode.matches("div")) {
                    target = target.parentNode.parentNode;
                } else {
                    target = target.parentNode;
                }
            }

            if (changed.indexOf(target) === -1) {
                changed.push(target);
            }
        });

        observer.disconnect();
        changed.forEach(setInlines);
        observer.observe(editor, options);

        console.log(changed);
    });

    observer.observe(editor, options);
}

/*------------------------------------------------------------------------------
 * Events
 *----------------------------------------------------------------------------*/

function handleInput(event) {
    setType();
}

/*------------------------------------------------------------------------------
 * Interactions
 *----------------------------------------------------------------------------*/

function setType() {
    let paragraphs = editor.querySelectorAll("div");
    paragraphs.forEach(function(paragraph) {
        let type = getType(paragraph.textContent);
        paragraph.setAttribute("data-type", type);
    });
}

function setInlines(block) {
    let pos = cursor.getPos();

    block.innerHTML = block.textContent.replace(
        /(\*\*.*\*\*)/,
        "<strong>$1</strong>"
    );

    cursor.setPos(pos);
}

// https://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container/4812022#4812022
function getCaret(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var selected = range.toString().length; // *
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        if (selected) {
            // *
            caretOffset = preCaretRange.toString().length - selected; // *
        } else {
            // *
            caretOffset = preCaretRange.toString().length;
        } // *
    }

    return caretOffset;
}

function setCaret(block, position) {
    var range = document.createRange();
    var sel = window.getSelection();

    range.setStart(blcok.childNodes[2], 5);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
}
/*------------------------------------------------------------------------------
 * Utilities
 *----------------------------------------------------------------------------*/

function parse() {
    let paragraphs = editor.textContent.split(/\n/);
    let forced = false;

    paragraphs.forEach(function(paragraph) {
        let type = getType(paragraph);

        if (forced === true && type !== "codeblock") {
            type = "codeblock";
        } else if (forced === false && type === "codeblock") {
            forced = true;
        } else {
            forced = false;
        }

        blocks.push({
            type: type,
            content: paragraph
        });
    });
}

function getType(block) {
    if (block === "") {
        return "empty";
    } else if (block.startsWith("#######")) {
        return "heading6";
    } else if (block.startsWith("#####")) {
        return "heading5";
    } else if (block.startsWith("####")) {
        return "heading4";
    } else if (block.startsWith("###")) {
        return "heading3";
    } else if (block.startsWith("##")) {
        return "heading2";
    } else if (block.startsWith("#")) {
        return "heading1";
    } else if (block.startsWith(">")) {
        return "blockquote";
    } else if (block.startsWith("```")) {
        return "codeblock";
    }

    return "text";
}

function write() {
    const wrapper = document.createElement("div");
    const br = document.createElement("br");
    let content;

    clear();

    blocks.forEach(function(block) {
        content = wrapper.cloneNode();

        if (block.type === "empty") {
            content.appendChild(br.cloneNode());
        } else {
            content.textContent = block.content;
        }

        content.setAttribute("data-type", block.type);
        editor.appendChild(content);
    });
}

function clear() {
    while (editor.firstChild) {
        editor.removeChild(editor.firstChild);
    }
}

/*------------------------------------------------------------------------------
 * Public
 *----------------------------------------------------------------------------*/

export { init };
