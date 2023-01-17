import type { TI18nFile, TI18nFunc, TI18nLang } from '@/@types';

// -- private variables ----------------------------------------------------------------------------

let _strings: TI18nFile = {};
let _stringsEN: TI18nFile = {};

// -- public functions -----------------------------------------------------------------------------

/**
 * Loads dynamically the string file of requested language.
 * @param lang - requested language
 */
export async function importStrings(lang: TI18nLang = 'en') {
    _stringsEN = (await import(`./lang/en.jsonc`)).default as TI18nFile;
    _strings =
        lang === 'en'
            ? { ..._stringsEN }
            : ((await import(`./lang/${lang}.jsonc`)).default as TI18nFile);
}

/**
 * Enables for i18n only specific string identifiers for a component.
 * @param component - identifier of the component
 * @param strings - list of string identifiers to enable
 */
export function enableStrings(component: string, strings: string[]) {
    if (component in _strings) {
        _strings[component] = Object.fromEntries(
            Object.entries(_strings[component]).filter(([key]) => strings.includes(key)),
        );
    }

    if (component in _stringsEN) {
        _stringsEN[component] = Object.fromEntries(
            Object.entries(_stringsEN[component]).filter(([key]) => strings.includes(key)),
        );
    }
}

/**
 * Factory function for i18n search function scoped to a component.
 *
 * @desc
 * If a component entry for the current language isn't found, it defaults to the corresponding
 * English set. If a component entry for the current language is found, the key is first searched in
 * the set, if not found it is then searched in the corresponding English set. If it still isn't
 * found the key itself will be returned as a fallback (however, such a possibility should be filtered
 * out during unit testing).
 *
 * @todo add unit tests to root out corner case explained in description
 *
 * @param component - identifier of the component
 * @returns i18n search function scoped to a component
 */
export function i18nFactory(component: string): TI18nFunc {
    const stringSetEN = _stringsEN[component];
    const stringSet = _strings[component] || stringSetEN;

    return stringSet === undefined
        ? (key: string) => key
        : (key: string) =>
              key in stringSet ? stringSet[key] : key in stringSetEN ? stringSetEN[key] : key;
}
