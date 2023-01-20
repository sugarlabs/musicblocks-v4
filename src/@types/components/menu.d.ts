import type { TAsset } from '../core/assets';

/** Type definition for feature flag toggles for the Menu component. */
export type TFeatureFlagMenu = {
    uploadFile: boolean;
    recording: boolean;
    exportDrawing: boolean;
    loadProject: boolean;
    saveProject: boolean;
};

/** Type definition for the i18n identifiers defined by the Menu component. */
export type TI18nMenu = 'menu.run' | 'menu.stop' | 'menu.reset';

/** Type definition for the asset identifiers defined by the Menu component. */
export type TAssetIdentifierMenu =
    | 'image.icon.run'
    | 'image.icon.stop'
    | 'image.icon.reset'
    | 'image.icon.saveProjectHTML'
    | 'image.icon.exportDrawing'
    | 'image.icon.startRecording'
    | 'image.icon.stopRecording';

/** Type definition for the items injected into the Menu component after load. */
export type TInjectedMenu = {
    flags: Record<keyof TFeatureFlagMenu, boolean>;
    i18n: Record<TI18nMenu, string>;
    assets: Record<TAssetIdentifierMenu, TAsset>;
};

/** Type definition for the events emitted by the Menu component. */
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

/** Type definition for the props to the Menu React component. */
export type TPropsMenu = {
    injected: TInjectedMenu;
    states: Record<'running', boolean>;
    handlers: Partial<Record<'run' | 'stop' | 'reset', CallableFunction>>;
};
