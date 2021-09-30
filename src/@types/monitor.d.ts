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
 * Interface for the message utilities class that is shared by the subcomponent instances of the
 * Monitor and used by the `useMessageEndpoint` hook to establist communication between components
 * and the corresponding Monitor subcomponents.
 *
 * @description This class is meant to be extended by the subcomponent classes and the
 * `useMessageEndpoint` hook.
 */
export interface IMessageUtils {
    /**
     * Saves a `name:method` key-value pair inside the component.
     *
     * @param name - registered name of the method.
     * @param method - registered method callback.
     */
    /* eslint-disable-next-line */
    registerMethod: (name: string, method: Function) => void;
    /**
     * Removes a `name:method` key-value pair from the component.
     *
     * @param name - registered name of the method.
     * @returns `true` if successful removal else `false`.
     */
    unregisterMethod: (name: string) => boolean;

    /*
     * Since arbitrary arguments can be sent to the following methods, use with caution (arguments
     * might not match method signature).
     */

    /**
     * Calls the method with the given name and passes the arguments.
     *
     * @param name - registered name of the method.
     * @param args - arguments to the method call.
     */
    doMethod: (name: string, ...args: unknown[]) => void;
    /**
     * Calls the method with the given name and passes the arguments, and returns a `Promise` of the
     * returned values.
     *
     * @param name - registered name of the method.
     * @param args - arguments to the method call.
     * @returns `Promise` instance for the returned value if valid method name, else `null`.
     */
    getMethodResult: (name: string, ...args: unknown[]) => Promise<unknown> | null;
    /**
     * Registers a getter and a setter function for the model state object.
     *
     * @description This also adds a force update hook which re-renders the corresponding
     * component when a state is updated.
     *
     * @param stateObject - model instance of the corresponding component.
     */
    registerStateObject: (stateObject: { [key: string]: unknown }) => void;
    /**
     * Returns a model state.
     *
     * @param state - name of the state.
     * @returns value of the state.
     */
    getState: (state: string) => unknown;
    /**
     * Sets a model state.
     *
     * @param state - name of the state.
     * @param value - value to store for the state.
     * */
    setState: (state: string, value: unknown) => void;
}

/**
 * Interface for the Monitor component.
 */
export interface IMonitor {
    /** Menu subcomponent instance of Monitor. */
    menu: IMenu;
    /** Palette subcomponent instance of Monitor. */
    palette: IPalette;

    manager: IManager;
}
