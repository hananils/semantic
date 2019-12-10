import Block from './block.js';
import { registerType } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

class Paragraph extends Block {}

registerType(Paragraph, 'last');
