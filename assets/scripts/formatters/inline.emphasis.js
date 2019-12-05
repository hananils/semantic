import { registerFormat } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat(function emphasis(content) {
    content = content.replace(/(_[^_]*_)/g, '<em>$1</em>');

    return content;
});
