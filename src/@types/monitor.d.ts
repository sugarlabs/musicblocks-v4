/**
 * Interface for the Palette subcomponent proxied by the Monitor component.
 */
export interface IPalette {
    /** Returns a `Promise` for the list of palette sections. */
    getSections: () => Promise<string[]>;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Getter for the Palette subcomponent. */
    palette: IPalette;
}
