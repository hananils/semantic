import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('inline', function emphasis(content, block) {
    content = content.replace(/(_[^_]*_)/g, '<em>$1</em>');

    return content;
});
