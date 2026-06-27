import { v4 as uuidv4 } from 'uuid';

// -- types ----------------------------------------------------------------------------------------

import type { ILayeredMap } from '../../@types/scope';

/** Interface for each node (frame) in the tree. */
interface TLayeredMapFrame<T> {
    /** Frame ID. */
    id: string;
    /** Parent frame. */
    parent: TLayeredMapFrame<T> | null;
    /** List of child frames. */
    children: TLayeredMapFrame<T>[];
    /** Key-value dictionary. */
    keyMap: T;
    /** Whether it is leaf frame. */
    leaf: boolean;
}

// -- public classes -------------------------------------------------------------------------------

/**
 * @class
 * Class that defines a layered-map data structure.
 * @description
 * [Layered Map](./README.md)
 * @typeParam T an object type (lists the keys and their respective value types)
 */
// eslint-disable-next-line
export class LayeredMap<T extends Object> implements ILayeredMap<T> {
    /** stores the tree data structure */
    private _frameMap: { [id: string]: TLayeredMapFrame<T> } = {};
    /** stores the ID of the root node (frame) */
    private _frameRootID: string;

    /**
     * @private
     * Helper function that returns a new UUID.
     * @returns UUID string
     */
    private _getUUID(): string {
        let id: string;
        do {
            id = uuidv4();
        } while (id in this._frameMap);
        return id;
    }

    // == public ===========================================

    /**
     * Creates a new layered map instance.
     */
    constructor();
    /**
     * Creates a new layered map instance.
     * @param keyMap - initial key-value dictionary (for root level)
     */
    constructor(keyMap: T);
    /**
     * @constructor
     * Creates a new layered map instance.
     * @param keyMap - initial key-value dictionary (for root level)
     */
    constructor(keyMap?: T) {
        this._frameRootID = this._getUUID();

        // create root node of the frame tree
        const rootFrame = (this._frameMap[this._frameRootID] = {
            id: this._frameRootID,
            parent: null,
            children: [],
            keyMap: {} as T,
            leaf: true,
        });

        if (keyMap === undefined) return;

        rootFrame.keyMap = { ...keyMap };
    }

    public get rootID(): string {
        return this._frameRootID;
    }

    public addFrame(frameParentID: string): string {
        if (!(frameParentID in this._frameMap)) {
            throw Error(`UndefinedError: Frame with ID "${frameParentID}" doesn't exist`);
        }

        const frameParent = this._frameMap[frameParentID];

        const id = this._getUUID();
        const frame = (this._frameMap[id] = {
            id,
            parent: frameParent,
            children: [],
            keyMap: {} as T,
            leaf: true,
        });

        frameParent.children.push(frame);
        frameParent.leaf = false;

        return id;
    }

    public removeFrame(frameID: string): void {
        if (!(frameID in this._frameMap)) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }

        if (frameID === this._frameRootID) {
            throw Error('InvalidOperationError: Cannot remove root frame');
        }

        if (!this._frameMap[frameID].leaf) {
            throw Error('InvalidOperationError: Frame has child frames');
        }

        const frameParent = this._frameMap[frameID].parent!;
        const frameIndex = frameParent.children.findIndex(({ id }) => id === frameID);
        if (frameIndex !== -1) {
            frameParent.children.splice(frameIndex, 1);
            if (frameParent.children.length === 0) {
                frameParent.leaf = true;
            }
        }

        delete this._frameMap[frameID];
    }

    public updateFrameKeyMap(frameID: string, keyMap: T): void {
        if (!(frameID in this._frameMap)) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }

        this._frameMap[frameID].keyMap = { ...keyMap };
    }

    public projectFlatMap(frameID: string): T {
        if (!(frameID in this._frameMap)) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }

        const map: T = {} as T;

        let frame = this._frameMap[frameID];

        do {
            Object.entries(frame.keyMap).forEach(([key, value]) => {
                if (key in map) return;
                // @ts-ignore
                map[key] = value;
            });

            frame = frame.parent!;
        } while (frame !== null);

        return map;
    }
}
