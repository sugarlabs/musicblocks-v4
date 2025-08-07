import { computeIncomingNotches } from '../utils/NotchCalculator';
import type { NotchEntry, Rect } from './Types';
import type TowerModel from '../../tower/model/model';

/** A quadtree node for spatial indexing of points */
class QuadNode<T extends { x: number; y: number }> {
    boundary: Rect;
    capacity: number;
    points: T[] = [];
    divided = false;
    ne?: QuadNode<T>;
    nw?: QuadNode<T>;
    se?: QuadNode<T>;
    sw?: QuadNode<T>;

    constructor(boundary: Rect, capacity = 4) {
        this.boundary = boundary;
        this.capacity = capacity;
    }

    contains(pt: T): boolean {
        const b = this.boundary;
        return pt.x >= b.x && pt.x < b.x + b.w && pt.y >= b.y && pt.y < b.y + b.h;
    }

    intersects(r: Rect): boolean {
        const b = this.boundary;
        return !(r.x > b.x + b.w || r.x + r.w < b.x || r.y > b.y + b.h || r.y + r.h < b.y);
    }

    subdivide(): void {
        const { x, y, w, h } = this.boundary;
        const hw = w / 2,
            hh = h / 2;
        this.ne = new QuadNode({ x: x + hw, y, w: hw, h: hh }, this.capacity);
        this.nw = new QuadNode({ x, y, w: hw, h: hh }, this.capacity);
        this.se = new QuadNode({ x: x + hw, y: y + hh, w: hw, h: hh }, this.capacity);
        this.sw = new QuadNode({ x, y: y + hh, w: hw, h: hh }, this.capacity);
        this.divided = true;
    }

    insert(pt: T): boolean {
        if (!this.contains(pt)) return false;
        if (this.points.length < this.capacity) {
            this.points.push(pt);
            return true;
        }
        if (!this.divided) this.subdivide();
        return (
            this.ne!.insert(pt) || this.nw!.insert(pt) || this.se!.insert(pt) || this.sw!.insert(pt)
        );
    }

    /** Remove all points matching the predicate */
    removeAll(pred: (pt: T) => boolean): void {
        this.points = this.points.filter((p) => !pred(p));
        if (this.divided) {
            this.ne!.removeAll(pred);
            this.nw!.removeAll(pred);
            this.se!.removeAll(pred);
            this.sw!.removeAll(pred);
        }
    }

    query(range: Rect, found: T[] = []): T[] {
        if (!this.intersects(range)) return found;
        for (const p of this.points) {
            if (
                p.x >= range.x &&
                p.x <= range.x + range.w &&
                p.y >= range.y &&
                p.y <= range.y + range.h
            ) {
                found.push(p);
            }
        }
        if (this.divided) {
            this.ne!.query(range, found);
            this.nw!.query(range, found);
            this.se!.query(range, found);
            this.sw!.query(range, found);
        }
        return found;
    }
}

/**
 * CollisionMap indexes incoming-notch coordinates for all bricks in a workspace.
 * Backed by a quadtree, it provides:
 *  - upsertTower: remove old + insert new notches for one tower
 *  - removeTower: clear a tower’s notches (self-collision prevention)
 *  - query(x,y): find all incoming notches near a point
 */
export class CollisionMap {
    private root: QuadNode<NotchEntry>;

    public insertNotch(n: NotchEntry) {
        this.root.insert(n);
    }

    constructor(bounds: Rect) {
        this.root = new QuadNode<NotchEntry>(bounds);
    }

    /** Remove all notch entries for the given towerId */
    removeTower(towerId: string): void {
        this.root.removeAll((n) => n.towerId === towerId);
    }

    /** Compute & insert incoming notches for every brick in the tower */
    upsertTower(tower: TowerModel): void {
        // clear stale entries
        this.removeTower(tower.id);

        // insert fresh notches
        for (const node of tower.nodesArray()) {
            const incoming = computeIncomingNotches(node.brick, node.position);
            for (const notch of incoming) {
                notch.towerId = tower.id;
                this.root.insert(notch);
            }
        }
    }

    /**
     * Query all incoming-notch entries within ±radius of (x,y).
     * Returns an array of matching NotchEntry.
     */
    query(x: number, y: number, radius = 1): NotchEntry[] {
        return this.root.query({
            x: x - radius,
            y: y - radius,
            w: radius * 2,
            h: radius * 2,
        });
    }
}
