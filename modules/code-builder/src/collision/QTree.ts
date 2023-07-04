import type { ICollisionSpace, TCollisionObject } from '@/@types/collision';

import Quadtree from 'quadtree-lib';

const QUADTREEMAXELEMS = 4;

export default class implements ICollisionSpace {
    private _width;
    private _height;
    private _objType: 'circle' | 'rect' = 'circle';

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

    public setOptions(options: { objType: 'circle' | 'rect' }): void {
        const { objType } = options;

        this._objType = objType;
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

    public checkCollision(object: { x: number; y: number }): string[] {
        return this._tree!.colliding(object, (objA, objB) => {
            if (this._objType === 'circle') {
                // width should be equal to height though
                const sizeObjA = Math.min(objA.width, objA.height);
                const sizeObjB = Math.min(objB.width, objB.height);

                const distance = Math.sqrt(
                    Math.pow(objA.x - objB.x, 2) + Math.pow(objA.y - objB.y, 2),
                );

                return distance < (sizeObjA >> 1) + (sizeObjB >> 1);
            }

            const [ax1, ax2, ax3, ax4] = [
                objA.x - (objA.width >> 1),
                objA.x + (objA.width >> 1),
                objA.x - (objA.width >> 1),
                objA.x + (objA.width >> 1),
            ];
            const [ay1, ay2, ay3, ay4] = [
                objA.y - (objA.height >> 1),
                objA.y - (objA.height >> 1),
                objA.y + (objA.height >> 1),
                objA.y + (objA.height >> 1),
            ];
            const [bx1, bx2, bx3, bx4] = [
                objB.x - (objB.width >> 1),
                objB.x + (objB.width >> 1),
                objB.x - (objB.width >> 1),
                objB.x + (objB.width >> 1),
            ];
            const [by1, by2, by3, by4] = [
                objB.y - (objB.height >> 1),
                objB.y - (objB.height >> 1),
                objB.y + (objB.height >> 1),
                objB.y + (objB.height >> 1),
            ];

            const [cx1, cx2, cx3, cx4] = [
                Math.max(ax1, bx1),
                Math.min(ax2, bx2),
                Math.max(ax3, bx3),
                Math.min(ax4, bx4),
            ];
            const [cy1, cy2, cy3, cy4] = [
                Math.max(ay1, by1),
                Math.max(ay2, by2),
                Math.min(ay3, by3),
                Math.min(ay4, by4),
            ];

            if (cx1 < cx2 && cx3 < cx4 && cy1 < cy3 && cy2 < cy4) {
                const areaA = (ax2 - ax1) * (ay3 - ay1);
                const areaB = (bx2 - bx1) * (by3 - by1);
                const areaC = (cx2 - cx1) * (cy3 - cy1);

                return areaC > Math.min(areaA, areaB);
            }

            return false;
        }).map(({ id }) => id);
    }

    public reset(): void {
        this._tree!.clear();
        this._objMap.clear();
    }
}
