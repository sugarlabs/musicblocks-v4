/*
 * Copyright (c) 2021, Liam Norman. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */


var PO = require('pofile');

var LOCALE = "en";

/**
 * Returns a translated string given its message ID and locale.
 *
 * @remarks
 * None
 *
 * @param original_text - Text to be translated.
 * @param locale - Text to be translated.
 * @returns The translated text.
 */
export function i18n(original_text: string, locale: string = "en"): string {
    // Ignore pitch numbers and pitch expressed as Hertz.

    var translated_text = "Not a translated phrase";

    let filename = 'src/i18n/lang/' + locale + '.po';

    var data = require('fs').readFileSync(filename, 'utf-8');
    var po = PO.parse(data);

    for (let t in po.items) {
        if (po.items[t].msgid === original_text) {
            translated_text = po.items[t].msgstr[0];
            if (translated_text === "") {
                return original_text;
            }
            return translated_text;
        }
    }
    return translated_text;
}
