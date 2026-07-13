import Quadtree from 'quadtree-lib';

import type { Bounds } from '@/@types/common.types';

export type CollisionObjectShape = 'circle' | 'square';

export interface CollisionObject extends Bounds {
    id: number;
}

export interface CollisionSpaceOptions {
    shape: CollisionObjectShape;
    threshold: number;
}

/**
 * Base class for a spatial structure that tracks objects within a fixed-size area and reports
 * collisions between them. Concrete subclasses decide how objects are stored and queried (e.g. a
 * flat list scanned pairwise, or a quadtree). Each object carries its own size, so spaces can mix
 * differently sized objects; shape and overlap threshold remain space-wide, via `setOptions`.
 */
export abstract class CollisionSpace {
    protected _width: number;
    protected _height: number;
    protected _shape: CollisionObjectShape = 'circle';
    protected _threshold = 0.5;

    constructor(width: number, height: number) {
        this._width = width;
        this._height = height;
    }

    public setOptions(options: Partial<CollisionSpaceOptions>): void {
        if (options.shape !== undefined) this._shape = options.shape;
        if (options.threshold !== undefined) this._threshold = options.threshold;
    }

    public abstract createObjects(objects: CollisionObject[]): void;

    public abstract updateObjects(objects: CollisionObject[]): void;

    public abstract removeObjects(ids: number[]): void;

    /** Returns the ids of every object in the space currently colliding with `object`. */
    public abstract checkCollision(object: CollisionObject): number[];

    /** Clears the space and restores its configuration to the defaults. */
    public reset(): void {
        this._shape = 'circle';
        this._threshold = 0.5;
    }

    /** Shared by every strategy: whether two objects collide, given the current shape/threshold. */
    protected _collides(objA: CollisionObject, objB: CollisionObject): boolean {
        return this._shape === 'circle'
            ? this._collidesAsCircles(objA, objB)
            : this._collidesAsSquares(objA, objB);
    }

    // Distance between centres vs. the sum of radii, scaled by the threshold: at 0 any touch
    // counts, and near 1 the circles must nearly coincide. Guards against non-square objects
    // (w !== h) the same way the reference implementation does, by taking the smaller dimension.
    private _collidesAsCircles(objA: CollisionObject, objB: CollisionObject): boolean {
        const radiusA = Math.min(objA.w, objA.h) / 2;
        const radiusB = Math.min(objB.w, objB.h) / 2;
        const distance = Math.hypot(objA.x - objB.x, objA.y - objB.y);

        return distance < (radiusA + radiusB) * (1 - this._threshold);
    }

    // Overlap area of the two bounding boxes vs. the smaller object's full area, scaled by the
    // threshold: at 0 any overlap counts, at 1 only a full overlap does.
    private _collidesAsSquares(objA: CollisionObject, objB: CollisionObject): boolean {
        const overlapX =
            Math.min(objA.x + objA.w / 2, objB.x + objB.w / 2) -
            Math.max(objA.x - objA.w / 2, objB.x - objB.w / 2);
        const overlapY =
            Math.min(objA.y + objA.h / 2, objB.y + objB.h / 2) -
            Math.max(objA.y - objA.h / 2, objB.y - objB.h / 2);

        if (overlapX <= 0 || overlapY <= 0) return false;

        const smallerArea = Math.min(objA.w * objA.h, objB.w * objB.h);
        return overlapX * overlapY > smallerArea * this._threshold;
    }
}

// -- Brute Force ----------------------------------------------------------------------------------

/** Collision space that checks every object against every other object. */
export class BruteForceCollisionSpace extends CollisionSpace {
    private _objects: CollisionObject[] = [];

    public createObjects(objects: CollisionObject[]): void {
        for (const object of objects) {
            const inBounds =
                object.x > object.w / 2 &&
                object.x < this._width - object.w / 2 &&
                object.y > object.h / 2 &&
                object.y < this._height - object.h / 2;

            if (inBounds) this._objects.push(object);
        }
    }

    public updateObjects(objects: CollisionObject[]): void {
        const positionById = new Map(objects.map((object) => [object.id, object]));

        this._objects = this._objects.map((object) => {
            const position = positionById.get(object.id);
            return position === undefined ? object : { ...object, x: position.x, y: position.y };
        });
    }

    public removeObjects(ids: number[]): void {
        const idsToRemove = new Set(ids);
        this._objects = this._objects.filter((object) => !idsToRemove.has(object.id));
    }

    public checkCollision(object: CollisionObject): number[] {
        // Excludes a same-id match, in case `object` is itself already tracked by the space.
        return this._objects
            .filter((other) => other.id !== object.id && this._collides(object, other))
            .map((other) => other.id);
    }

    public override reset(): void {
        super.reset();
        this._objects = [];
    }
}

// -- QuadTree -------------------------------------------------------------------------------------

// Leaves further split once they hold more than this many elements.
const QUADTREE_MAX_ELEMENTS = 4;

// quadtree-lib expects `width`/`height` (not our `w`/`h`) for its own bounding-box partitioning.
type QuadtreeItem = CollisionObject & { width: number; height: number };

/** Collision space that partitions objects into a quadtree to narrow down collision checks. */
export class QuadtreeCollisionSpace extends CollisionSpace {
    private _tree: Quadtree<QuadtreeItem>;
    private _itemsById = new Map<number, QuadtreeItem>();

    constructor(width: number, height: number) {
        super(width, height);
        this._tree = new Quadtree<QuadtreeItem>({
            width,
            height,
            maxElements: QUADTREE_MAX_ELEMENTS,
        });
    }

    public createObjects(objects: CollisionObject[]): void {
        for (const object of objects) {
            const inBounds =
                object.x > object.w / 2 &&
                object.x < this._width - object.w / 2 &&
                object.y > object.h / 2 &&
                object.y < this._height - object.h / 2;

            if (!inBounds) continue;

            const item: QuadtreeItem = { ...object, width: object.w, height: object.h };
            this._itemsById.set(item.id, item);
            this._tree.push(item);
        }
    }

    public updateObjects(objects: CollisionObject[]): void {
        for (const object of objects) {
            const item = this._itemsById.get(object.id);
            if (!item) continue;

            // The tree indexes by position at insertion time, so a moved item must be removed
            // and re-pushed rather than mutated in place.
            this._tree.remove(item);
            item.x = object.x;
            item.y = object.y;
            this._tree.push(item);
        }
    }

    public removeObjects(ids: number[]): void {
        for (const id of ids) {
            const item = this._itemsById.get(id);
            if (!item) continue;

            this._tree.remove(item);
            this._itemsById.delete(id);
        }
    }

    public checkCollision(object: CollisionObject): number[] {
        const probe: QuadtreeItem = { ...object, width: object.w, height: object.h };

        // Excludes a same-id match, in case `object` is itself already tracked by the space.
        return this._tree
            .colliding(probe, (a, b) => a.id !== b.id && this._collides(a, b))
            .map((item) => item.id);
    }

    public override reset(): void {
        super.reset();
        this._tree.clear();
        this._itemsById.clear();
    }
}
