import Block from './block.js';
import { registerType } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class OrderedList extends Block {
    matches(content) {
        return /^\s{0,3}[0-9]+\.\s/.test(content);
    }

    enter(current, created) {
        let number = parseInt(
            current.textContent.match(/^\s{0,3}([0-9]+)\.\s/)[0]
        );

        number++;

        created.textContent = number + '. ' + created.textContent;
        this.parse(created.textContent, created);

        if (number < 10) {
            return 3;
        }

        return 4;
    }

    backspace() {}
}

registerType(OrderedList);
