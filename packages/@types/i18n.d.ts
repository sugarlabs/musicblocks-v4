/** Type representing the allowed i18n language name strings. */
export type TI18nLang = 'en' | 'es';

/** Type representing the schema of a i18n language file which stores the individual strings. */
export type TI18nFile = {
    [key: string]: string;
};
