import { IComponent } from '.';

/**
 * Interface that represents the Menu component's API.
 */
export interface IComponentMenu extends IComponent {
    /**
     * Mounts a callback associated with `run`.
     * @param name name of the hook
     * @param callback callback function to associate with the hook
     */
    mountHook(name: 'run', callback: CallableFunction): void;
    /**
     * Mounts a callback associated with `reset`.
     * @param name name of the hook
     * @param callback callback function to associate with the hook
     */
    mountHook(name: 'reset', callback: CallableFunction): void;
    /**
     * Mounts a callback associated with a special hook name.
     * @param name name of the hook
     * @param callback callback function to associate with the hook
     */
    mountHook(name: string, callback: CallableFunction): void;
}

/** Type representing the allowed i18n string identifiers for the Menu component. */
type TI18nMenu = 'reset' | 'run' | 'stop';

/** Type representing the type overloaded i18n function for the Menu component. */
export type TI18nFuncMenu = (key: TI18nMenu) => string;
