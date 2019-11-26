import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('block', function blockquote(content, block) {
    if (content.startsWith('> ')) {
        delete block.className;
        delete block.dataset;

        block.classList.add('blockquote');

        return true;
    }

    return false;
});
