import Block from '../block.js';
import { registerType } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class OrderedList extends Block {
    matches(content) {
        return /^\s{0,3}[0-9]+\.\s/.test(content);
    }
}

registerType(OrderedList);
