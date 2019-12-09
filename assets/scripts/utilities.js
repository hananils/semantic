function toBlock(node) {
    if (node.nodeType === 3) {
        node = node.parentNode;
    }

    if (!node) {
        return node;
    }

    return node.closest('div[data-type]');
}

function toString(editor) {
    let content = '';

    editor.childNodes.forEach(function(node) {
        content += node.textContent + '\n';
    });

    return content.trim();
}

export { toBlock, toString };
