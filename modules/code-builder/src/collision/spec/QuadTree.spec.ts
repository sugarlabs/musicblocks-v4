import { describe, it, expect } from 'vitest';
import { CollisionSpaceQuadTree } from '../index';

describe('QuadTree Collision', () => {
    it('should insert objects correctly', () => {
        const cs = new CollisionSpaceQuadTree(100, 100);
        const obj = { id: 'a', x: 10, y: 10, width: 10, height: 10 };

        cs.addObjects([obj]);
        const retrieved = cs.checkCollision({ id: 'test', x: 10, y: 10, width: 10, height: 10 });

        expect(retrieved).toContain('a');
    });

    it('should detect collisions correctly', () => {
        const cs = new CollisionSpaceQuadTree(100, 100);
        const objA = { id: 'a', x: 0, y: 0, width: 10, height: 10 };
        const objB = { id: 'b', x: 5, y: 5, width: 10, height: 10 };

        cs.addObjects([objA, objB]);
        const results = cs.checkCollision({ id: 'test', x: 5, y: 5, width: 10, height: 10 });

        expect(results).toContain('a');
        expect(results).toContain('b');
    });
});
