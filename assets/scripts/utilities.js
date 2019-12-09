function toBlock(node) {
    if (node.nodeType === 3) {
        node = node.parentNode;
    }

    if (!node) {
        return node;
    }

    return node.closest('div[data-type]');
}

export { toBlock };
