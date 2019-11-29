/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Block {
    matches(content, block) {
        return true;
    }

    parse(content, block) {
        this.clear(block);
        block.dataset.type = this.constructor.name.toLowerCase();

        return true;
    }

    clear(block) {
        for (var key in block.dataset) {
            delete block.dataset[key];
        }
    }
}

export default Block;
