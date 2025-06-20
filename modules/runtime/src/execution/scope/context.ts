/* eslint-disable @typescript-eslint/no-use-before-define */
import { LayeredMap } from './utils';
import type { IContextStack, IContextManager } from '../../@types/scope';

/**
 * Manages the global frame and can spawn/destroy named ContextStacks.
 */
export class ContextManager<T extends object> implements IContextManager<T> {
    private _keyMapOrig: T;
    private _layeredMap: LayeredMap<T>;
    private _contextStackMap: Record<string, IContextStack<T>> = {};

    constructor(keyMap: T) {
        this._keyMapOrig = { ...keyMap };
        this._layeredMap = new LayeredMap<T>(keyMap);
    }

    public createContextStack(): IContextStack<T> {
        const stackID = this._layeredMap.addFrame(this._layeredMap.rootID);
        const stack = new ContextStack<T>(
            this._layeredMap,
            [this._layeredMap.rootID, stackID],
            this,
        );
        this._contextStackMap[stackID] = stack;
        return stack;
    }

    public getContextStack(contextStackID: string): IContextStack<T> {
        const stack = this._contextStackMap[contextStackID];
        if (!stack) {
            throw Error(
                `InvalidAccessError: Context stack with ID "${contextStackID}" doesn't exist`,
            );
        }
        return stack;
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

    public updateContextGlobalKeyMap(keyMap: T, commit = false): void {
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

/**
 * Represents one independent stack of frames (e.g. one thread’s scope chain).
 */
export class ContextStack<T extends object> implements IContextStack<T> {
    private _layeredMap: LayeredMap<T>;
    private _frameIDs: string[];
    private _manager: ContextManager<T>;

    constructor(layeredMap: LayeredMap<T>, frameIDs: [string, string], manager: ContextManager<T>) {
        this._layeredMap = layeredMap;
        this._frameIDs = [...frameIDs];
        this._manager = manager;
    }

    /** The second frame ID is this stack’s unique handle */
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
        return this._layeredMap.projectFlatMap(this._frameIDs.at(-1)!);
    }
    public set contextLocalKeyMap(keyMap: T) {
        this._layeredMap.updateFrameKeyMap(this._frameIDs.at(-1)!, keyMap);
    }

    public pushFrame(): void {
        const newID = this._layeredMap.addFrame(this._frameIDs.at(-1)!);
        this._frameIDs.push(newID);
    }

    public popFrame(): void {
        if (this._frameIDs.length === 2) {
            throw Error('InvalidOperationError: No context frame remaining to pop');
        }
        const top = this._frameIDs.pop()!;
        this._layeredMap.removeFrame(top);
    }
}
