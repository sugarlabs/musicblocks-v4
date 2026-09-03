import { describe, it, expect } from 'vitest';
import { checkCollision } from '../utils';
import type { TCollisionObject } from '@/@types/collision';

describe('Collision Utils - checkCollision', () => {
    describe('Circle collisions', () => {
        it('should correctly detect intersecting circles', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 };
            const objB: TCollisionObject = { id: 'B', x: 20, y: 10, width: 20, height: 20 };

            expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0 })).toBe(true);
        });

        it('should correctly detect separated circles', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 };
            const objB: TCollisionObject = { id: 'B', x: 50, y: 50, width: 20, height: 20 };

            expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0 })).toBe(false);
        });

        it('should apply collision threshold properly', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 };
            // distance = 15. radii sum = 20.
            const objB: TCollisionObject = { id: 'B', x: 25, y: 10, width: 20, height: 20 };

            // With 0 threshold, requires distance < 20 (15 < 20 -> true)
            expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0 })).toBe(true);

            // With 0.5 threshold, requires distance < 10 (15 < 10 -> false)
            expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0.5 })).toBe(false);
        });
    });

    describe('Rectangle collisions', () => {
        it('should correctly detect intersecting rectangles', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 };
            const objB: TCollisionObject = { id: 'B', x: 20, y: 10, width: 20, height: 20 };

            expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0 })).toBe(true);
        });

        it('should correctly detect separated rectangles', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 };
            const objB: TCollisionObject = { id: 'B', x: 50, y: 50, width: 20, height: 20 };

            expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0 })).toBe(false);
        });

        it('should apply collision threshold properly', () => {
            const objA: TCollisionObject = { id: 'A', x: 10, y: 10, width: 20, height: 20 }; // Area 400
            // objB overlaps objA by width=5, height=20. Intersection area = 100.
            // min area = 400.
            const objB: TCollisionObject = { id: 'B', x: 25, y: 10, width: 20, height: 20 };

            // With 0 threshold, intersection area 100 > 0 (true)
            expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0 })).toBe(true);

            // With 0.5 threshold, requires intersection area > 400 * 0.5 = 200 (100 > 200 -> false)
            expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0.5 })).toBe(false);
        });
    });
});
