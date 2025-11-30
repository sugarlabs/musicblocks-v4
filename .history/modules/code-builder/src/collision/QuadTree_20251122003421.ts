import type { ICollisionSpace, TCollisionObject } from '@/@types/collision';

import Quadtree from 'quadtree-lib';
import { checkCollision } from './utils';

const QUADTREEMAXELEMS = 4;

export default class implements ICollisionSpace {
    private _width;
    private _height;
    private _objType: 'circle' | 'rect' = 'circle';
    private _colThres = 0;

    private _tree?: Quadtree<TCollisionObject>;
    private _objMap: Map<string, TCollisionObject> = new Map();

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;

        this._tree = new Quadtree({
            width,
            height,
            maxElements: QUADTREEMAXELEMS,
        });
    }

    public setOptions(options: { objType: 'circle' | 'rect'; colThres: number }): void {
        const { objType, colThres } = options;

        this._objType = objType;
        this._colThres = colThres;
    }

    public addObjects(objects: TCollisionObject[]): void {
        objects.forEach(({ id, x, y, width, height }) => {
            if (
                x > width >> 1 &&
                x < this._width - (width >> 1) &&
                y > height >> 1 &&
                y < this._height - (height >> 1)
            ) {
                const object = { id, x, y, width, height };

                this._objMap.set(id, object);
                this._tree!.push(object);
            }
        });
    }

    public delObjects(objects: TCollisionObject[]): void {
        const objectIds = objects.map(({ id }) => id);

        objectIds.forEach((id) => {
            const object = this._objMap.get(id)!;
            this._tree!.remove(object);
            this._objMap.delete(id);
        });
    }

    public checkCollision(object: TCollisionObject): string[] {
        return this._tree!.colliding(object, (objA, objB) => {
            return checkCollision(objA, objB, {
                objType: this._objType,
                colThres: this._colThres,
            });
        }).map(({ id }) => id);
    }

    public reset(): void {
        this._tree!.clear();
        this._objMap.clear();
    }
}
