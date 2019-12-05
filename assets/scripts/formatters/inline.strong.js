import { registerFormat } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat(function strong(content) {
    content = content.replace(/(\*\*[^*]*\*\*)/g, '<strong>$1</strong>');

    return content;
});
