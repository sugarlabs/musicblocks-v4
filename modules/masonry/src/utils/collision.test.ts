// Unit tests for both collision-space strategies. Most behavior is asserted once and run
// against both classes via `describe.each`, since they're expected to behave identically from
// the outside - only the internal storage/query strategy differs. A separate suite
// cross-validates the two engines against each other on a shared, deterministic layout.

import { describe, expect, it } from 'vitest';

import {
    BruteForceCollisionSpace,
    QuadtreeCollisionSpace,
    type CollisionObject,
    type CollisionSpace,
} from './collision';

const SPACE_CLASSES: {
    name: string;
    SpaceClass: new (width: number, height: number) => CollisionSpace;
}[] = [
    { name: 'BruteForceCollisionSpace', SpaceClass: BruteForceCollisionSpace },
    { name: 'QuadtreeCollisionSpace', SpaceClass: QuadtreeCollisionSpace },
];

describe.each(SPACE_CLASSES)('$name', ({ SpaceClass }) => {
    it('drops objects placed too close to the edge', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 0 });

        // half = 10, so a centre of 5 falls outside the valid [10, 90] margin on both axes
        space.createObjects([{ id: 1, x: 5, y: 5, w: 20, h: 20 }]);

        expect(space.checkCollision({ id: 999, x: 5, y: 5, w: 20, h: 20 })).toEqual([]);
    });

    it('keeps objects placed within the valid margin', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 0 });

        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        expect(space.checkCollision({ id: 999, x: 50, y: 50, w: 20, h: 20 })).toEqual([1]);
    });

    it('detects circle collision within the combined radius, not beyond it', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'circle', threshold: 0 });

        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]); // radius 10

        expect(space.checkCollision({ id: 999, x: 65, y: 50, w: 20, h: 20 })).toEqual([1]); // distance 15 < 20
        expect(space.checkCollision({ id: 999, x: 75, y: 50, w: 20, h: 20 })).toEqual([]); // distance 25 > 20
    });

    it('detects square collision when bounding boxes overlap, not when they gap', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 0 });

        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]); // spans [40, 60]

        expect(space.checkCollision({ id: 999, x: 65, y: 50, w: 20, h: 20 })).toEqual([1]);
        expect(space.checkCollision({ id: 999, x: 90, y: 50, w: 20, h: 20 })).toEqual([]);
    });

    it('requires more overlap as the threshold increases', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 0 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        const probe = { id: 999, x: 58, y: 50, w: 20, h: 20 }; // a small overlap

        expect(space.checkCollision(probe)).toEqual([1]);

        space.setOptions({ threshold: 0.9 });
        expect(space.checkCollision(probe)).toEqual([]);
    });

    it('excludes the queried object from its own results when already tracked', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'circle', threshold: 0 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        expect(space.checkCollision({ id: 1, x: 50, y: 50, w: 20, h: 20 })).toEqual([]);
    });

    it('stops reporting a removed object as colliding', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'circle', threshold: 0 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        space.removeObjects([1]);

        expect(space.checkCollision({ id: 999, x: 50, y: 50, w: 20, h: 20 })).toEqual([]);
    });

    it('reflects a moved object at its new position', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'circle', threshold: 0 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        const probe = { id: 999, x: 80, y: 50, w: 20, h: 20 };
        expect(space.checkCollision(probe)).toEqual([]);

        space.updateObjects([{ id: 1, x: 75, y: 50, w: 20, h: 20 }]);
        expect(space.checkCollision(probe)).toEqual([1]);
    });

    it('reset clears tracked objects and restores the default shape/threshold', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 1 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        space.reset();
        expect(space.checkCollision({ id: 999, x: 50, y: 50, w: 20, h: 20 })).toEqual([]);

        // Re-add and probe at a distance that only collides under the *default* circle/0.5
        // config, not under the square/threshold=1 config set before reset.
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);
        expect(space.checkCollision({ id: 999, x: 55, y: 50, w: 20, h: 20 })).toEqual([1]);
    });

    it('setOptions updates only the fields provided', () => {
        const space = new SpaceClass(100, 100);
        space.setOptions({ shape: 'square', threshold: 0 });
        space.createObjects([{ id: 1, x: 50, y: 50, w: 20, h: 20 }]);

        // Corners overlap as squares, but the centres (~21.2 apart) are farther than the
        // circle diameter (20) - so this only ever collides while shape stays 'square'.
        const probe = { id: 999, x: 65, y: 65, w: 20, h: 20 };
        expect(space.checkCollision(probe)).toEqual([1]);

        space.setOptions({ threshold: 0.05 });
        expect(space.checkCollision(probe)).toEqual([1]);
    });
});

describe('cross-engine parity', () => {
    it('brute-force and quadtree report the same collisions for a deterministic layout', () => {
        const width = 200;
        const height = 200;
        const size = 16;
        const spacing = 12; // smaller than `size`, so neighbours are guaranteed to overlap

        const objects: CollisionObject[] = [];
        let id = 1;
        for (let row = 0; row < 6; row += 1) {
            for (let col = 0; col < 6; col += 1) {
                objects.push({
                    id,
                    x: 40 + col * spacing,
                    y: 40 + row * spacing,
                    w: size,
                    h: size,
                });
                id += 1;
            }
        }

        const bruteForce = new BruteForceCollisionSpace(width, height);
        const quadtree = new QuadtreeCollisionSpace(width, height);

        for (const space of [bruteForce, quadtree]) {
            space.setOptions({ shape: 'circle', threshold: 0.3 });
            space.createObjects(objects);
        }

        for (const probe of objects) {
            const bruteForceIds = bruteForce.checkCollision(probe).sort((a, b) => a - b);
            const quadtreeIds = quadtree.checkCollision(probe).sort((a, b) => a - b);

            expect(quadtreeIds).toEqual(bruteForceIds);
        }
    });
});
