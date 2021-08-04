/*
 * Copyright (c) 2021, Liam Norman. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */


var PO = require('pofile');

var LOCALE = "en";
var TRANSLATIONS = {};

/**
 * Loads translations dictionary given a locale.
 *
 * @remarks
 * None
 *
 * @param locale - Locale to switch to.
 * @returns Returns nothing, stores data in TRANSLATIONS variable.
 */
export function loadLocale(locale: string = "en"): void {

    LOCALE = locale;

    var dict = {};
    let filename = 'src/i18n/lang/' + locale + '.po';
    var data = require('fs').readFileSync(filename, 'utf-8');
    var po = PO.parse(data);

    for (let t in po.items) {
        dict[po.items[t].msgid] = po.items[t].msgstr[0];
    }

    TRANSLATIONS = dict;
}


/**
 * Returns a translated string given its message ID and locale.
 *
 * @remarks
 * None
 *
 * @param original_text - Text to be translated.
 * @returns The translated text.
 */
export function i18n(original_text: string): string {
    result = TRANSLATIONS[original_text];
    if (result === null) {
        return "";
    }
    return TRANSLATIONS[original_text]
}

/**
 * Returns a translated string given its message ID and locale.
 *
 * @remarks
 * Loads a po file each time func is called, so it may be better to use i18n().
 *
 * @param original_text - Text to be translated.
 * @param locale - Text to be translated.
 * @returns The translated text.
 */
export function i18nPoQuery(original_text: string, locale: string = "en"): string {

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
