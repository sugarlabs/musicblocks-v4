import type { TI18nLang } from '.';
import type { TComponentId } from './components';

/** Type defintion of a preset app configuration. */
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
    components: (
        | TComponentId
        | {
              /** Component identifier. */
              id: TComponentId;
              /** Feature flags. */
              flags?: {
                  [flag: string]: boolean;
              };
              /** Syntax elements to enable; enable all if `true`. */
              elements?: string[] | true;
          }
    )[];
}
