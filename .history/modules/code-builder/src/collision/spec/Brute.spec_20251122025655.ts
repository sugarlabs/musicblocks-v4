// File: src/collision/spec/Brute.spec.ts
import { describe, it, expect } from 'vitest';
import { detectCollision } from '../Brute';

describe('Brute Collision', () => {
    it('should detect collision when objects overlap', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 5, y: 5, width: 10, height: 10 };

        const result = detectCollision(objA, objB);
        expect(result).toBe(true);
    });

    it('should not detect collision when objects are apart', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 20, y: 20, width: 10, height: 10 };

        const result = detectCollision(objA, objB);
        expect(result).toBe(false);
    });
});
