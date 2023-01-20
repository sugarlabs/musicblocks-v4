import type { TAsset } from '../core/assets';

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
