/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Inline {
    matches(content, block) {
        return true;
    }

    parse(content, block) {
        delete block.dataset;
        block.dataset.type = this.constructor.name.toLowerCase();

        return true;
    }
}

export default Inline;
