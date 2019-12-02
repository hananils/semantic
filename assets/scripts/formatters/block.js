/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Block {
    name() {
        return this.constructor.name.toLowerCase();
    }

    matches(content, block) {
        return true;
    }

    parse(content, block) {
        this.clear(block);
        block.dataset.type = this.name();

        return true;
    }

    clear(block) {
        for (var key in block.dataset) {
            delete block.dataset[key];
        }
    }

    enter(current, created) {
        return 0;
    }
}

export default Block;
