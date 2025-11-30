import { describe, it, expect } from 'vitest';
import { QuadTree } from '../QuadTree';

describe('QuadTree Collision', () => {
    it('should insert objects correctly', () => {
        const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }); // Adjust constructor
        const obj = { x: 10, y: 10, width: 5, height: 5 }; // Example object

        qt.insert(obj); // Replace with real method if different
        const result = qt.retrieve(obj);

        expect(result).toContain(obj); // Adjust expected result
    });

    it('should detect collisions correctly', () => {
        const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
        const objA = { x: 10, y: 10, width: 5, height: 5 };
        const objB = { x: 12, y: 12, width: 5, height: 5 };

        qt.insert(objA);
        qt.insert(objB);

        const collisions = qt.checkCollisions(); // Replace with real method
        expect(collisions).toContainEqual([objA, objB]);
    });

    // Add more test cases for other QuadTree methods
});
