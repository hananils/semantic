import { registerFormat } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat('strong', function(content) {
    content = content.replace(/(\*\*[^*]*\*\*)/g, '<strong>$1</strong>');

    return content;
});
