import type { IComponent } from '.';
import type { TAsset } from '../core/assets';

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

/** Type definition for feature flag toggles for the Menu component. */
export type TFeatureFlagMenu = {
    uploadFile: boolean;
    recording: boolean;
    exportDrawing: boolean;
    loadProject: boolean;
    saveProject: boolean;
};

/** Type definition for the items injected into the Menu component after load. */
export type TInjectedMenu = {
    flags: Record<keyof TFeatureFlagMenu, boolean>;
    i18n: Record<'menu.run' | 'menu.stop' | 'menu.reset', string>;
    assets: Record<
        | 'image.icon.run'
        | 'image.icon.stop'
        | 'image.icon.reset'
        | 'image.icon.saveProjectHTML'
        | 'image.icon.exportDrawing'
        | 'image.icon.startRecording'
        | 'image.icon.stopRecording',
        TAsset
    >;
};

/** Type definition for the event emitted by the Menu component. */
export type TEventMenu =
    | 'menu.run'
    | 'menu.stop'
    | 'menu.reset'
    | 'menu.uploadFile'
    | 'menu.startRecording'
    | 'menu.stopRecording'
    | 'menu.exportDrawing'
    | 'menu.loadProject'
    | 'menu.saveProject';
