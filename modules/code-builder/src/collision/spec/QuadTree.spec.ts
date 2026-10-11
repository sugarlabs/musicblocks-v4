import { describe, it, expect, beforeEach } from 'vitest';
import QuadTree from '../QuadTree';
import type { TCollisionObject } from '@/@types/collision';

describe('Collision Space - QuadTree', () => {
    let quadTree: QuadTree;

    beforeEach(() => {
        quadTree = new QuadTree(100, 100);
    });

    it('should add valid objects', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        quadTree.addObjects([objA]);

        const collisions = quadTree.checkCollision(objA);
        expect(collisions).toContain('A');
    });

    it('should not add objects that are out of bounds', () => {
        const objOut: TCollisionObject = { id: 'Out', x: 2, y: 20, width: 10, height: 10 };
        quadTree.addObjects([objOut]);

        const collisions = quadTree.checkCollision({ id: 'B', x: 2, y: 20, width: 10, height: 10 });
        expect(collisions).toHaveLength(0);
    });

    it('should delete objects correctly', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        quadTree.addObjects([objA]);
        quadTree.delObjects([objA]);

        const collisions = quadTree.checkCollision(objA);
        expect(collisions).toHaveLength(0);
    });

    it('should reset objects', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 10, height: 10 };
        quadTree.addObjects([objA]);
        quadTree.reset();

        const collisions = quadTree.checkCollision(objA);
        expect(collisions).toHaveLength(0);
    });

    it('should correctly set options and check collision', () => {
        const objA: TCollisionObject = { id: 'A', x: 20, y: 20, width: 20, height: 20 };
        quadTree.addObjects([objA]);

        quadTree.setOptions({ objType: 'rect', colThres: 0.5 });
        const objB: TCollisionObject = { id: 'B', x: 30, y: 20, width: 20, height: 20 };

        expect(quadTree.checkCollision(objB)).toHaveLength(0);

        quadTree.setOptions({ objType: 'rect', colThres: 0 });
        expect(quadTree.checkCollision(objB)).toContain('A');
    });
});
