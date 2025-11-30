import { describe, it, expect } from 'vitest';
import { Brute } from '../Brute';

describe('Brute Collision', () => {
    it('should detect collision when objects overlap', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 }; // Replace with real structure
        const objB = { x: 5, y: 5, width: 10, height: 10 }; // Replace with real structure

        const result = Brute.detectCollision(objA, objB); // Replace with actual function
        expect(result).toBe(true); // Adjust expected output
    });

    it('should not detect collision when objects are apart', () => {
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 20, y: 20, width: 10, height: 10 };

        const result = Brute.detectCollision(objA, objB);
        expect(result).toBe(false);
    });

    // Add more test cases here based on Brute functions
});
