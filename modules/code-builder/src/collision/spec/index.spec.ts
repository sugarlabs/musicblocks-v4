import { describe, it, expect } from 'vitest';
import { checkCollision } from '../utils';
import type { TCollisionObject } from '@/@types/collision';

describe('Collision Utilities', () => {
    it('should detect overlapping rectangles', () => {
        const objA: TCollisionObject = { id: 'A', x: 5, y: 5, width: 10, height: 10 };
        const objB: TCollisionObject = { id: 'B', x: 10, y: 10, width: 10, height: 10 };

        expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0 })).toBe(true);
    });

    it('should not detect collision for non-overlapping rectangles', () => {
        const objA: TCollisionObject = { id: 'A', x: 5, y: 5, width: 10, height: 10 };
        const objB: TCollisionObject = { id: 'B', x: 25, y: 25, width: 10, height: 10 };

        expect(checkCollision(objA, objB, { objType: 'rect', colThres: 0 })).toBe(false);
    });

    it('should detect overlapping circles', () => {
        const objA: TCollisionObject = { id: 'A', x: 5, y: 5, width: 10, height: 10 };
        const objB: TCollisionObject = { id: 'B', x: 12, y: 5, width: 10, height: 10 };

        expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0 })).toBe(true);
    });

    it('should not detect collision for non-overlapping circles', () => {
        const objA: TCollisionObject = { id: 'A', x: 5, y: 5, width: 10, height: 10 };
        const objB: TCollisionObject = { id: 'B', x: 20, y: 5, width: 10, height: 10 };

        expect(checkCollision(objA, objB, { objType: 'circle', colThres: 0 })).toBe(false);
    });
});
