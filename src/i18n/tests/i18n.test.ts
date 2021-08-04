/*
 * Copyright (c) 2021, Liam Norman. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

 import {
     i18n
     loadLocale
 } from '../i18n';

describe('Internationalization utilities', () => {
    test("Query the word 'Hello' in French and recieve 'Bonjour'", () => {
        loadLocale("fr");
        expect(i18n("hello")).toBe("bonjour");
        // Phrases with no corresponding msgid should be detected
        let not_translated = i18n("Not a translated phrase");
        expect(not_translated).toBe("");
        // The translation of some words is is "" if they are meant to be the same as the msgid.
        loadLocale("fr");
        let same_as_english = i18n("tempo");
        expect(same_as_english).toBe("tempo");
    });

    test("Have 'hello' and 'note' i18n calls  be added to .po_ files", () => {
        let hello = i18n("hello");
        let note = i18n("note");
        let keyboard = i18n("keyboard");
        let tempo = i18n("tempo");

    });
});
