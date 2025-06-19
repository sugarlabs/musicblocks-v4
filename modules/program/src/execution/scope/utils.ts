import { v4 as uuidv4 } from 'uuid';
import type { ILayeredMap } from '../../@types/scope';

interface TLayeredMapFrame<T> {
    id: string;
    parent: TLayeredMapFrame<T> | null;
    children: TLayeredMapFrame<T>[];
    keyMap: T;
    leaf: boolean;
}

/**
 * A tree of frames, each with its own key→value map.
 * projectFlatMap(id) merges that frame + all ancestors, with child keys shadowing parent keys.
 */
export class LayeredMap<T extends object> implements ILayeredMap<T> {
    private _frameMap: Record<string, TLayeredMapFrame<T>> = {};
    private _frameRootID: string;

    constructor(initial?: T) {
        this._frameRootID = this._getUUID();
        // create root frame
        this._frameMap[this._frameRootID] = {
            id: this._frameRootID,
            parent: null,
            children: [],
            keyMap: initial ? { ...initial } : ({} as T),
            leaf: true,
        };
    }

    private _getUUID(): string {
        let id: string;
        do {
            id = uuidv4();
        } while (id in this._frameMap);
        return id;
    }

    public get rootID(): string {
        return this._frameRootID;
    }

    public addFrame(frameParentID: string): string {
        const parent = this._frameMap[frameParentID];
        if (!parent) {
            throw Error(`UndefinedError: Frame with ID "${frameParentID}" doesn't exist`);
        }

        const id = this._getUUID();
        const frame = (this._frameMap[id] = {
            id,
            parent,
            children: [],
            keyMap: {} as T,
            leaf: true,
        });
        parent.children.push(frame);
        parent.leaf = false;
        return id;
    }

    public removeFrame(frameID: string): void {
        const frame = this._frameMap[frameID];
        if (!frame) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }
        if (frameID === this._frameRootID) {
            throw Error('InvalidOperationError: Cannot remove root frame');
        }
        if (!frame.leaf) {
            throw Error('InvalidOperationError: Frame has child frames');
        }
        const parent = frame.parent!;
        const idx = parent.children.findIndex((c) => c.id === frameID);
        if (idx !== -1) {
            parent.children.splice(idx, 1);
            if (parent.children.length === 0) parent.leaf = true;
        }
        delete this._frameMap[frameID];
    }

    public updateFrameKeyMap(frameID: string, keyMap: T): void {
        const frame = this._frameMap[frameID];
        if (!frame) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }
        frame.keyMap = { ...keyMap };
    }

    public projectFlatMap(frameID: string): T {
        let frame = this._frameMap[frameID];
        if (!frame) {
            throw Error(`UndefinedError: Frame with ID "${frameID}" doesn't exist`);
        }
        const result = {} as T;
        while (frame) {
            for (const [k, v] of Object.entries(frame.keyMap) as [keyof T, T[keyof T]][]) {
                if (!(k in result)) {
                    result[k] = v;
                }
            }
            frame = frame.parent!;
        }
        return result;
    }
}
