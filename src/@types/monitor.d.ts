import { TAppLanguage, TAppTheme } from './config';

/**
 * Interface for the Palette subcomponent proxied by the Monitor component.
 */
export interface IPalette {
    /** Returns a `Promise` for the list of palette sections. */
    getSections: () => Promise<string[]>;
}

export interface IBlockSize {
    label: string;
    size: number;
}

/**
 * Interface for the Artboard subcomponent by the Monitor component.
 */
export interface IArtboard {
    /** Cleans the artwork of all the artboards */
    clean: () => void;
}

/**
 * Interface for the Menu subcomponent of the Monitor
 */
export interface IMenu {
    // -- Setters for the global app configurations ----------------------------

    /** Sets the app theme */
    setTheme: (theme: TAppTheme) => void;
    /** Sets the app language */
    setLanguage: (language: TAppLanguage) => void;
    /** Sets the app horizontal scroll */
    setHorizontalScroll: (horizontalScroll: boolean) => void;
    /** Sets the app sprite wrap (when sprite goes out of workspace) */
    setTurtleWrap: (turtleWrap: boolean) => void;
    /** Sets the app project builder brick size */
    setBrickSize: (brickSize: number) => void;

    // -- Setters for the global project configurations ------------------------

    /** Sets the master volume */
    setMasterVolume: (masterVolume: number) => void;

    // -- Getters for values to present ----------------------------------------

    /** Returns a Promise for a list of language code and corresponding names */
    fetchLanguages: () => Promise<{ code: TAppLanguage; name: string }[]>;
    /** Returns a Promise for a list of brick sizes and corresponding labels */
    fetchBrickSizes: () => Promise<{ label: string; value: number }[]>;

    // -- Actions --------------------------------------------------------------

    /** Runs the project in normal speed */
    play: () => void;
    /** Runs the project at a lowered speed */
    playSlowly: () => void;
    /** Runs the project one instruction at a time */
    playStepByStep: () => void;
    /** Hides all the project builder bricks */
    hideBricks: () => void;
    /** Shows all the project builder bricks */
    showBricks: () => void;
    /** Folds all project builder clamp bricks */
    foldBricks: () => void;
    /** Unfolds all project builder clamp bricks */
    unfoldBricks: () => void;
    /** Cleans the artboards */
    cleanArtboards: () => void;
    /** Undo last action */
    undo: () => void;
    /** Redo last action */
    redo: () => void;

    // --

    hideBlocks: () => void;
    collapseBlocks: () => void;
    cleanArtwork: () => void;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Getter for the Palette subcomponent. */
    palette: IPalette;
    menu: IMenu;
    manager: IManager;
}

/**
 * Interface for the Artboard Manager subcomponent proxied by the Monitor component.
 */
export interface IArtboardManager {
    /** pass the message to corresponding artboard.  */
    enableHorizontalScroll: (isEnabled: boolean) => void;

    enableTurtleWrap: (isWrapOn: boolean) => void;

    playArtboard: (id: number) => void;

    stopArtboard: (id: number) => void;

    removeArtboard: (id: number) => void;

    addArtboard: (id: number, x: number, y: number, angle: number) => void;
}
