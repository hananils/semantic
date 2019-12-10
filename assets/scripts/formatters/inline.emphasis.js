import { registerFormat } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat('emphasis', function(content) {
    content = content.replace(/(_[^_]*_)/g, '<em>$1</em>');

    return content;
});
