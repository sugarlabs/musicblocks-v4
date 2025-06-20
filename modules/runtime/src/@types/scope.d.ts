export interface ILayeredMap<T extends object> {
    rootID: string;
    addFrame(frameParentID: string): string;
    removeFrame(frameID: string): void;
    updateFrameKeyMap(frameID: string, keyMap: T): void;
    projectFlatMap(frameID: string): T;
}

export interface IContextStack<T extends object> {
    /** Unique ID for this stack (second frame in its chain) */
    readonly contextID: string;

    /** Read/write the global frame’s entire key-map */
    contextGlobalKeyMap: T;

    /** Read/write the current (top) frame’s key-map */
    contextLocalKeyMap: T;

    /** Enter a new local frame */
    pushFrame(): void;

    /** Exit the current local frame */
    popFrame(): void;
}

// factory fnc
export interface IContextManager<T extends object> {
    /** Create a new independent context stack */
    createContextStack(): IContextStack<T>;

    /** Fetch an existing stack by its ID */
    getContextStack(contextStackID: string): IContextStack<T>;

    /** Tear down an existing stack by its ID */
    removeContextStack(contextStackID: string): void;

    /** Read-only view of the global frame */
    readonly contextGlobalKeyMap: T;

    /**
     * Overwrite the global frame’s key-map.
     * @param commit if true, also update the “reset” baseline
     */
    updateContextGlobalKeyMap(keyMap: T, commit?: boolean): void;

    /** Reset everything back to the original global map */
    reset(): void;
}

export interface IThreadContext<T extends object> {
    /** The unique ID of this thread’s context stack */
    readonly id: string;

    /** Local frame CRUD */
    getLocal<K extends keyof T>(key: K): T[K] | undefined;
    setLocal<K extends keyof T>(key: K, value: T[K]): void;
    deleteLocal(key: keyof T): void;

    /** Scope push/pop */
    pushScope(): void;
    popScope(): void;

    /** Global frame CRUD */
    getGlobal<K extends keyof T>(key: K): T[K] | undefined;
    setGlobal<K extends keyof T>(key: K, value: T[K]): void;
    deleteGlobal(key: keyof T): void;
}

export interface IThreadManager<T extends object> {
    /** Spawn a new thread (with its own local-stack) */
    createThread(): IThreadContext<T>;

    /** Look up an existing thread by ID */
    getThread(threadID: string): IThreadContext<T>;

    /** Tear down a thread by ID */
    deleteThread(threadID: string): void;
}
