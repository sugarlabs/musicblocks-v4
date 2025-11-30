// src/collision/spec/QuadTree.spec.ts
import { describe, it, expect } from 'vitest';
import { QuadTree } from '../QuadTree';

describe('QuadTree Collision', () => {
    it('should insert objects correctly', () => {
        const qt = new QuadTree(100, 100);
        const obj = { x: 10, y: 10, width: 10, height: 10 };

        qt.insert(obj);
        const retrieved = qt.query(obj);

        expect(retrieved).toContain(obj);
    });

    it('should detect collisions correctly', () => {
        const qt = new QuadTree(100, 100);
        const objA = { x: 0, y: 0, width: 10, height: 10 };
        const objB = { x: 5, y: 5, width: 10, height: 10 };

        qt.insert(objA);
        const results = qt.query(objB);

        expect(results).toContain(objA);
    });
});
