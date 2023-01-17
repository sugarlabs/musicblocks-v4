import type { TI18nLang } from './core/i18n';
import type { TFeatureFlagMenu } from './components/menu';

/** Type definition of an app configuration preset's component configuration. */
export type TAppComponentConfig =
    | {
          id: 'editor';
      }
    | {
          id: 'menu';
          flags: TFeatureFlagMenu;
      }
    | {
          id: 'painter';
          elements?: string[] | true;
      }
    | {
          id: 'singer';
          elements?: string[] | true;
      };

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
    components: TAppComponentConfig[];
}
