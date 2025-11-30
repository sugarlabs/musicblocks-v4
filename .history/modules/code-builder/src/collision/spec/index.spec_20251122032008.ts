// File: src/collision/spec/index.spec.ts
import { describe, it, expect } from 'vitest';
import { checkCollision } from '../utils';

describe('Collision Utilities', () => {
    it('should detect overlapping rectangles', () => {
        const objA = { x: 5, y: 5, width: 10, height: 10 }; // center at (5,5)
        const objB = { x: 10, y: 10, width: 10, height: 10 }; // center at (10,10)

        const result = checkCollision(objA, objB, { objType: 'rect', colThres: 0 });
        expect(result).toBe(true);
    });

    it('should not detect collision for non-overlapping rectangles', () => {
        const objA = { x: 5, y: 5, width: 10, height: 10 }; // center at (5,5)
        const objB = { x: 10, y: 10, width: 10, height: 10 }; // center at (10,10)

        const result = checkCollision(objA, objB, { objType: 'rect', colThres: 0 });
        expect(result).toBe(false);
    });
});
