// -- types ----------------------------------------------------------------------------------------

import { IAppConfig, IProjectConfig } from '@/@types/context';

// -- constants ------------------------------------------------------------------------------------

/** Default app configurations (used in `ConfigContext`) */
export const appConfig: IAppConfig = {
    theme: 'light',
    language: 'en',
    menuAutoHide: false,
    horizontalScroll: false,
    spriteWrap: true,
    brickSizeRange: { min: 1, max: 5 },
    brickSize: 2,
};

/** Default project configurations (used in `ConfigContext`) */
export const projectConfig: IProjectConfig = {
    masterVolumeRange: { min: 0, max: 100 },
    masterVolume: 50,
};

// Other constants

// -- Menu -----------------------------------------------------------------------------------------

/** Duration before menu hide is triggered after cursor moves out of unhide zone */
export const MENUAUTOHIDEDELAY = 2000;
/** Whether menu is hidden on load (if menuAutoHide is `true`) */
export const MENUHIDDENONLOAD = false;

// -- Artboard -------------------------------------------------------------------------------------

/** CSS `z-index` of the wrapper for the artboards */
export const Z_INDEX_ARTBOARD_WRAPPER = 1;
/** CSS `z-index` of the wrapper for the sprites */
export const Z_INDEX_ARTBOARD_SPRITE_WRAPPER = 100;
/** Stroke width (in pixels) of the lines drawn */
export const ARTBOARD_LINE_WIDTH = 4;
