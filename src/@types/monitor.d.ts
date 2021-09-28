/**
 * Interface for the Palette subcomponent proxied by the Monitor component.
 */
export interface IPalette {
    /** Returns a `Promise` for the list of palette sections. */
    getSections: () => Promise<string[]>;
}

/**
 * Interface for the Artboard subcomponent by the Monitor component.
 */
export interface IArtboard {
    /** Cleans the artwork of all the artboards */
    clean: () => void;
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

// -------------------------------------------------------------------------------------------------

/**
 * Interface for the utilities class that is shared by the subcomponent instances of the Monitor.
 * This class is meant to be extended by the subcomponent classes.
 */
export interface IMonitorUtils {
    /** Saves a `name:method` key-value pair inside the component */
    /* eslint-disable-next-line */
    registerMethod: (name: string, method: Function) => void;
    /** Removes a `name:method` key-value pair from the component */
    unregisterMethod: (name: string) => boolean;

    /*
     * Since arbitrary arguments can be sent to the following methods, use with caution (arguments
     * might not match method signature).
     */

    /** Calls the method with the given name and passes the arguments. */
    doMethod: (name: string, ...args: unknown[]) => void;
    /**
     * Calls the method with the given name and passes the arguments, and returns a `Promise` of the
     * returned values.
     */
    getMethodResult: (name: string, ...args: unknown[]) => Promise<unknown> | null;
    /** Registers a getter and a setter function for the model state object */
    registerStateObject: (stateObject: { [key: string]: unknown }, forceUpdate: () => void) => void;
    /** Returns a model state */
    getState: (state: string) => unknown;
    /** Sets a model state */
    setState: (state: string, value: unknown) => void;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Menu subcomponent instance of Monitor */
    menu: IMenu;

    /** Getter for the Palette subcomponent. */
    palette: IPalette;
    manager: IManager;
}
