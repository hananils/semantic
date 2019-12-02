import Block from './block.js';
import { registerType } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class UnorderedList extends Block {
    matches(content) {
        return /^\s{0,3}-\s/.test(content);
    }

    enter(current, created) {
        created.textContent = '- ' + created.textContent;
        this.parse(created.textContent, created);

        return 2;
    }
}

registerType(UnorderedList);
