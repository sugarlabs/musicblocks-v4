import type { TI18nFile, TI18nLang } from '@/@types/core/i18n';

// -- private variables ----------------------------------------------------------------------------

let _strings: TI18nFile = {};
let _stringsEN: TI18nFile = {};

// -- public functions -----------------------------------------------------------------------------

/**
 * Loads dynamically the string file of requested language.
 * @param lang - requested language
 */
export async function importStrings(lang: TI18nLang = 'en') {
    _stringsEN = (await import('./lang/en')).default as TI18nFile;
    _strings =
        lang === 'en'
            ? { ..._stringsEN }
            : ((await import(`./lang/${lang}.ts`)).default as TI18nFile);
}

/**
 * Returns i18n string map corresponding to string keys
 * @param keys list of string keys
 */
export function getStrings(keys: string[]): { [key: string]: string } {
    return Object.fromEntries(
        keys.map((key) => [
            key,
            key in _strings ? _strings[key] : key in _stringsEN ? _stringsEN[key] : key,
        ]),
    );
}
