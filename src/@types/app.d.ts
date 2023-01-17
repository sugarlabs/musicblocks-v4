import type { TI18nLang } from '.';
import type { TComponentId } from './components';

/** Type definition of an app configuration preset's component configuration. */
export interface IAppComponentConfig {
    /** Component identifier. */
    id: TComponentId;
    /** Feature flags. */
    flags?: {
        [flag: string]: boolean;
    };
    /** Syntax elements to enable; enable all if `true`. */
    elements?: string[] | true;
}

/** Type defintion of an app configuration preset. */
export interface IAppConfig {
    /** Configuration name. */
    name: string;
    /** Configuration description. */
    desc: string;
    /** Global flags. */
    env: {
        /** i18n language. */
        lang: TI18nLang;
    };
    /** List of components to load */
    components: (TComponentId | IAppComponentConfig)[];
}
