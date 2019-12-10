import { registerFormat } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat('code', function(content) {
    content = content.replace(/(`[^`]{1,}`)/g, '<code>$1</code>');

    return content;
});
