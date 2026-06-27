import { LayeredMap } from './utils';

// -- types ----------------------------------------------------------------------------------------

import type { IContextStack, IContextManager } from '../../@types/scope';

// -- public classes -------------------------------------------------------------------------------

/**
 * @class
 * Defines a `Context` stack.
 * @description
 * A context stack handles the creation, querying, and removal of individual context frames.
 * @typeParam T type-definition of the context.
 */
// eslint-disable-next-line
export class ContextStack<T extends Object> implements IContextStack<T> {
    /** Layered map instance. */
    private _layeredMap: LayeredMap<T>;
    /** Stores list of context frame IDs. */
    private _frameIDs: string[];
    /** Context Manager instance which created this context stack. */
    private _manager: ContextManager<T>;

    /**
     * Helper function that returns the frame ID of the topmost frame in the stack.
     * @returns frame ID string
     */
    private get _frameTopID(): string {
        return this._frameIDs[this._frameIDs.length - 1];
    }

    // == public ===========================================

    /**
     * @constructor
     * Creates a new context stack instance.
     * @param layeredMap layered map instance
     * @param frameIDs list of context frame IDs (contains the IDs of root and current frame)
     * @param manager corresponding context manager instance
     */
    constructor(layeredMap: LayeredMap<T>, frameIDs: [string, string], manager: ContextManager<T>) {
        this._layeredMap = layeredMap;
        this._frameIDs = frameIDs;
        this._manager = manager;
    }

    public get contextID(): string {
        return this._frameIDs[1];
    }

    public get contextGlobalKeyMap(): T {
        return this._manager.contextGlobalKeyMap;
    }

    public set contextGlobalKeyMap(keyMap: T) {
        this._manager.updateContextGlobalKeyMap(keyMap);
    }

    public get contextLocalKeyMap(): T {
        return this._layeredMap.projectFlatMap(this._frameTopID);
    }

    public set contextLocalKeyMap(keyMap: T) {
        this._layeredMap.updateFrameKeyMap(this._frameTopID, keyMap);
    }

    public pushFrame(): void {
        this._frameIDs.push(this._layeredMap.addFrame(this._frameTopID));
    }

    public popFrame(): void {
        if (this._frameIDs.length === 2) {
            throw Error('InvalidOperationError: No context frame remaining to pop');
        }

        const frameID = this._frameIDs.pop()!;
        this._layeredMap.removeFrame(frameID);
    }
}

/**
 * @class
 * Defines a `Context` manager.
 * @description
 * Manages a context set including different context stack instances; consider each context stack to
 * be a scope root inside the global context scope. This also provides access to the global context
 * of the context set.
 * @typeParam T type-definition of the context.
 */
// eslint-disable-next-line
export class ContextManager<T extends Object> implements IContextManager<T> {
    /** Stores original (global initial) key-value dictionary. */
    private _keyMapOrig: T;
    /** Stores the layered map instance. */
    private _layeredMap: LayeredMap<T>;
    /** Stores the context stack instances for by ID. */
    private _contextStackMap: { [key: string]: IContextStack<T> } = {};

    // == public ===========================================

    /**
     * Creates a new context manager instance.
     * @param keyMap initial key-value dictionary (global context)
     */
    constructor(keyMap: T) {
        this._keyMapOrig = { ...keyMap };
        this._layeredMap = new LayeredMap<T>(keyMap);
    }

    public createContextStack(): IContextStack<T> {
        const contextID = this._layeredMap.addFrame(this._layeredMap.rootID);
        const context = new ContextStack<T>(
            this._layeredMap,
            [this._layeredMap.rootID, contextID],
            this,
        );

        this._contextStackMap[contextID] = context;

        return context;
    }

    public getContextStack(contextStackID: string): IContextStack<T> {
        if (!(contextStackID in this._contextStackMap)) {
            throw Error(
                `InvalidAccessError: Context stack with ID "${contextStackID}" doesn't exist`,
            );
        }

        return this._contextStackMap[contextStackID];
    }

    public removeContextStack(contextStackID: string): void {
        if (!(contextStackID in this._contextStackMap)) {
            throw Error(
                `InvalidAccessError: Context stack with ID "${contextStackID}" doesn't exist`,
            );
        }

        delete this._contextStackMap[contextStackID];
    }

    public get contextGlobalKeyMap(): T {
        return this._layeredMap.projectFlatMap(this._layeredMap.rootID);
    }

    public updateContextGlobalKeyMap(keyMap: T, commit?: boolean): void {
        this._layeredMap.updateFrameKeyMap(this._layeredMap.rootID, keyMap);
        if (commit) {
            this._keyMapOrig = { ...keyMap };
        }
    }

    public reset(): void {
        this._layeredMap = new LayeredMap<T>({ ...this._keyMapOrig });
        this._contextStackMap = {};
    }
}
