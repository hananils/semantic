import { registerFormat } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat(function code(content, block) {
    content = content.replace(/(`[^`]*`)/g, '<code>$1</code>');

    return content;
});
