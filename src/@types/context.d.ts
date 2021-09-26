import { TAppTheme, TAppLanguage } from './config';

/**
 * Interface for global app configurations
 */
export interface IAppConfig {
    /** UI Theme */
    theme: TAppTheme;
    /** UI Language */
    language: TAppLanguage;
    /** Whether menu auto-hides on moving cursor away */
    menuAutoHide: boolean;
    /** Whether horizontal scroll is enabled */
    horizontalScroll: boolean;
    /** Whether sprite wrap is enabled (when sprite goes out of workspace) */
    spriteWrap: boolean;
    /** Range of project builder brick sizes */
    brickSizeRange: { min: number; max: number };
    /** Size of project builder bricks */
    brickSize: number;
}

/**
 * Interface for global project configurations
 */
export interface IProjectConfig {
    /** Range of master volume */
    masterVolumeRange: { min: number; max: number };
    /** Master volume */
    masterVolume: number;
}

/**
 * Interface for global configurations context
 */
export interface IConfigContext {
    /** Global app configurations */
    appConfig: IAppConfig;
    /** Method to set global app configurations */
    setAppConfig: (appConfig: IAppConfig) => void;
    /** Global app configurations */
    projectConfig: IProjectConfig;
    /** Method to set global app configurations */
    setProjectConfig: (projectConfig: IProjectConfig) => void;
}

/**
 * Interface for artBoard Context
 */
export interface IArtBoardContext {
    artBoardList: IArtboardModel[];
    setArtBoardList: (artboard: IartBoard) => void;
    numberOfArtboards: number;
}
