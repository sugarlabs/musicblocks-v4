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

export interface IMenu {
    /** Returns a `Promise` for the list of languages available. */
    getLanguages: () => Promise<string[]>;

    getBlockSizes: () => Promise<IBlockSize[]>;

    /** updates the language from Menu */
    changeLanguage: (language: string) => void;

    updateHorizontalScroll: (isEnabled: boolean) => void;

    updateTurtleWrap: (isWrapOn: boolean) => void;

    changeBlockSize: (blockSize: number) => void;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Getter for the Palette subcomponent. */
    palette: IPalette;
    menu: IMenu;
}
