import type { ICollisionSpace, TCollisionObject } from '@/@types/collision';

import { checkCollision } from './utils';

export default class implements ICollisionSpace {
    private _width;
    private _height;
    private _objType: 'circle' | 'rect' = 'circle';
    private _colThres = 0;

    private _objects: TCollisionObject[] = [];

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
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
                this._objects.push({ id, x, y, width, height });
            }
        });
    }

    public delObjects(objects: TCollisionObject[]): void {
        const objectIds = objects.map(({ id }) => id);

        this._objects = this._objects.filter(({ id }) => !objectIds.includes(id));
    }

    public checkCollision(object: TCollisionObject): string[] {
        return this._objects
            .filter((_object) => {
                const objA = { ...object };
                const objB = { ..._object };

                return checkCollision(objA, objB, {
                    objType: this._objType,
                    colThres: this._colThres,
                });
            })
            .map(({ id }) => id);
    }

    public reset(): void {
        this._objects = [];
    }
}
