/**
 * Interface for the Palette subcomponent proxied by the Monitor component.
 */
export interface IPalette {
    /** Returns a `Promise` for the list of palette sections. */
    getSections: () => Promise<string[]>;
}

export interface IMenu{
    /** Returns a `Promise` for the list of languages available. */
    getLanguages: () => Promise<string[]>;

    /** updates the ;anguage from Menu */
    changeLanguage: (language: string) => void;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Getter for the Palette subcomponent. */
    palette: IPalette;
}
