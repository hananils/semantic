import Formatters from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

Formatters.register('block', function heading(content, block) {
    if (content.startsWith('#')) {
        let hierarchy = content.match(/#+/)[0];

        block.className = '';
        block.classList.add('heading');

        delete block.dataset;
        block.dataset.hierarchy = hierarchy.length;

        return true;
    }

    return false;
});
