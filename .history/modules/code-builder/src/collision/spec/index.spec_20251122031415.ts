// File: src/collision/spec/index.spec.ts
import { describe, it, expect } from 'vitest';
import { checkCollision } from '../utils';

describe('Collision Utilities', () => {
    it('should detect overlapping rectangles', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 5, y: 5, width: 10, height: 10 };

        const result = checkCollision(objA, objB, { objType: 'rect', colThres: 0 });
        expect(result).toBe(true);
    });

    it('should not detect collision for non-overlapping rectangles', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 20, y: 20, width: 10, height: 10 };

        const result = checkCollision(objA, objB, { objType: 'rect', colThres: 0 });
        expect(result).toBe(false);
    });
});
