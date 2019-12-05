import { registerFormat } from '../formatters.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

registerFormat(function kirbytag(content) {
    content = content.replace(/\([a-z0-9_-]+:[^(]*\)/gi, function(match) {
        match = match.replace(/\(?[a-z0-9_-]+:/gi, '<span>$&</span>');
        match = match.replace(/\)/gi, '<span>$&</span>');

        return '<strong class="semantic-kirbytag">' + match + '</strong>';
    });

    return content;
});
