import Semantic from './editor.js';

/**
 * hana+nils · Büro für Gestaltung
 * https://hananils.de · buero@hananils.de
 */

document.addEventListener('DOMContentLoaded', function() {
    var editors = document.querySelectorAll('.semantic-editor');

    editors.forEach(function(editor) {
        let thing = new Semantic(editor);
    });
});
