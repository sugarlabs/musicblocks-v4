// Unit tests for WorkspaceManager, which owns the map of towers and the one
// operation that spans two of them. Pure model logic — no DOM — so this runs
// in the node environment.

import { beforeEach, describe, expect, it } from 'vitest';

import WorkspaceManager from './model';
import { createSimpleBrick, resetFactoryCounter } from '../../brick/utils/brickFactory';

describe('WorkspaceManager', () => {
    let manager: WorkspaceManager;

    beforeEach(() => {
        resetFactoryCounter();
        manager = new WorkspaceManager();
    });

    describe('creating and removing towers', () => {
        it('creates a tower holding the brick it was given', () => {
            const brick = createSimpleBrick();
            const tower = manager.createTower(brick, { x: 10, y: 20 });

            expect(tower.hasBrick(brick.uuid)).toBe(true);
            expect(manager.getTower(tower.id)).toBe(tower);
            expect(manager.allTowers).toHaveLength(1);
        });

        it('gives each tower its own id', () => {
            const first = manager.createTower(createSimpleBrick(), { x: 0, y: 0 });
            const second = manager.createTower(createSimpleBrick(), { x: 0, y: 0 });

            expect(first.id).not.toBe(second.id);
            expect(manager.allTowers).toHaveLength(2);
        });

        it('removes a tower and reports whether there was one', () => {
            const tower = manager.createTower(createSimpleBrick(), { x: 0, y: 0 });

            expect(manager.removeTower(tower.id)).toBe(true);
            expect(manager.removeTower(tower.id)).toBe(false);
            expect(manager.getTower(tower.id)).toBeUndefined();
            expect(manager.allTowers).toHaveLength(0);
        });

        it('returns undefined for a tower that was never created', () => {
            expect(manager.getTower('tower_404')).toBeUndefined();
        });
    });

    describe('clear', () => {
        it('drops every tower and restarts the id sequence', () => {
            const first = manager.createTower(createSimpleBrick(), { x: 0, y: 0 });
            manager.createTower(createSimpleBrick(), { x: 0, y: 0 });

            manager.clear();
            expect(manager.allTowers).toHaveLength(0);

            // The counter resets, so the next tower takes the first id again.
            const afterClear = manager.createTower(createSimpleBrick(), { x: 0, y: 0 });
            expect(afterClear.id).toBe(first.id);
        });
    });

    describe('connectBricksAcrossTowers', () => {
        it('throws when neither brick belongs to a tower', () => {
            expect(() =>
                manager.connectBricksAcrossTowers('nope', 'also-nope', 'n1', 'n2', 'top'),
            ).toThrow('Brick(s) not found');
        });

        it('throws when only one of the two bricks is in a tower', () => {
            const brick = createSimpleBrick();
            manager.createTower(brick, { x: 0, y: 0 });

            expect(() =>
                manager.connectBricksAcrossTowers(brick.uuid, 'nope', 'n1', 'n2', 'top'),
            ).toThrow('Brick(s) not found');
        });
    });
});
