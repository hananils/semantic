import { registerFormat } from '../register.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat('reference', function(content) {
    content = content.replace(
        /([#@^])([a-z0-9\/\._-]+)/gi,
        '<a class="semantic-reference"><span>$1</span>$2</a>'
    );

    return content;
});
