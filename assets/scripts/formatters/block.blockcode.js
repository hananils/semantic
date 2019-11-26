import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('block', function blockcode(content, block) {
    if (content.startsWith('```')) {
        delete block.className;
        delete block.dataset;

        block.classList.add('blockcode');

        return true;
    }

    return false;
});
