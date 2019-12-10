import Block from './block.js';
import { registerType } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Empty extends Block {
    matches(content) {
        return content === '';
    }

    parse(content, block) {
        delete block.dataset;
        block.dataset.type = this.constructor.name.toLowerCase();
        block.innerHTML = block.textContent;
        block.removeAttribute('placeholder');

        if (!block.childNodes.length) {
            const br = document.createElement('br');

            block.appendChild(br.cloneNode());
        }

        return true;
    }
}

registerType(Empty, 'first');
