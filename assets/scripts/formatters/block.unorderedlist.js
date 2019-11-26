import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('block', function unorderedlist(content, block) {
    if (content.startsWith('- ')) {
        delete block.dataset;

        block.className = '';
        block.classList.add('unorderedlist');

        return true;
    }

    return false;
});
