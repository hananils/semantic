import Block from './block.js';
import { registerType } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Ruler extends Block {
    matches(content) {
        return /^\s{0,3}[-*=]{3}/.test(content);
    }
}

registerType(Ruler);
