import type { ICollisionSpace, TCollisionObject } from '@/@types/collision';
import { checkCollision } from './utils';

export default class Brute implements ICollisionSpace {
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
            this._objects.push({ id, x, y, width, height });
        });
    }

    public delObjects(objects: TCollisionObject[]): void {
        const ids = objects.map(({ id }) => id);
        this._objects = this._objects.filter(({ id }) => !ids.includes(id));
    }

    public checkCollision(object: TCollisionObject): string[] {
        return this._objects
            .filter((obj) =>
                checkCollision(object, obj, {
                    objType: this._objType,
                    colThres: this._colThres,
                }),
            )
            .map(({ id }) => id);
    }

    public reset(): void {
        this._objects = [];
    }
}
