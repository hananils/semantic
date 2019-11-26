import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('inline', function strong(content, block) {
    content = content.replace(/(\*\*[^*]*\*\*)/g, '<strong>$1</strong>');

    return content;
});
