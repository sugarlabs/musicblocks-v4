import { describe, it, expect, beforeEach } from 'vitest';
import Brute from '../Brute';
import type { TCollisionObject } from '@/@types/collision';

describe('Collision Space - Brute', () => {
    let brute: Brute;

    beforeEach(() => {
        brute = new Brute(100, 100);
    });

    it('should add valid objects', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        brute.addObjects([objA]);

        const objB: TCollisionObject = { id: 'B', x: 20, y: 20, width: 10, height: 10 };
        const collisions = brute.checkCollision(objB);
        expect(collisions).toContain('A');
    });

    it('should not add objects that are out of bounds', () => {
        // bounds: x > width>>1 (5) and x < 100 - 5 (95)
        const objOut: TCollisionObject = { id: 'Out', x: 2, y: 20, width: 10, height: 10 };
        brute.addObjects([objOut]);

        const collisions = brute.checkCollision({ id: 'B', x: 2, y: 20, width: 10, height: 10 });
        expect(collisions).toHaveLength(0);
    });

    it('should delete objects correctly', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        brute.addObjects([objA]);
        brute.delObjects([objA]);

        const collisions = brute.checkCollision(objA);
        expect(collisions).toHaveLength(0);
    });

    it('should reset objects', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        brute.addObjects([objA]);
        brute.reset();

        const collisions = brute.checkCollision(objA);
        expect(collisions).toHaveLength(0);
    });

    it('should correctly set options and check collision', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 20, height: 20 };
        brute.addObjects([objA]);

        brute.setOptions({ objType: 'rect', colThres: 0.5 });
        const objB: TCollisionObject = { id: 'B', x: 30, y: 20, width: 20, height: 20 };

        expect(brute.checkCollision(objB)).toHaveLength(0);

        brute.setOptions({ objType: 'rect', colThres: 0 });
        expect(brute.checkCollision(objB)).toContain('A');
    });
});
