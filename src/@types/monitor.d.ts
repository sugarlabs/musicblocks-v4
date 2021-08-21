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

export interface IMenu {
    /** Returns a `Promise` for the list of languages available. */
    getLanguages: () => Promise<string[]>;

    getBlockSizes: () => Promise<IBlockSize[]>;

    /** updates the language from Menu */
    changeLanguage: (language: string) => void;

    updateHorizontalScroll: (isEnabled: boolean) => void;

    updateTurtleWrap: (isWrapOn: boolean) => void;

    changeBlockSize: (blockSize: number) => void;

    updateVolume: (vol: number) => void;

    play: () => void;

    playStepByStep: () => void;

    playSlowly: () => void;

    hideBlocks: () => void;

    cleanArtwork: () => void;

    collapseBlocks: () => void;

    undo: () => void;

    redo: () => void;
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
