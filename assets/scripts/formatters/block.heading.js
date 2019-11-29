import Block from '../block.js';
import { registerType } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Heading extends Block {
    matches(content) {
        return /^\s{0,3}#+\s/.test(content);
    }

    parse(content, block) {
        let hierarchy = content.match(/^#+/)[0];

        this.clear(block);
        block.dataset.type = 'heading';
        block.dataset.hierarchy = hierarchy.length;

        return true;
    }
}

registerType(Heading);
