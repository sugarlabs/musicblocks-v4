import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
import type { ArgumentConnectorMeta, TowerState } from '@/@types/workspace.types';
import { makeEmptyExpression, makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';

import { extractArgumentConnectors } from './argument-collision';
import { joinArg, resolveArgumentConnection } from './argument-connect';
import { QuadtreeCollisionSpace } from './collision';

/**
 * Builds a workspace the way the store does: every tower placed at its own position, with all of
 * their connector points seeded into one shared collision space.
 */
function workspace(towers: { id: string; root: TowerNode; position: Point }[]) {
    const space = new QuadtreeCollisionSpace(4000, 4000);
    const connectors: Record<number, ArgumentConnectorMeta> = {};
    const record: Record<string, TowerState> = {};

    for (const tower of towers) {
        tower.root.model.setPosition(tower.position.x, tower.position.y);
        record[tower.id] = tower;

        const results = extractArgumentConnectors(tower.id, tower.root);
        space.createObjects(results.map((result) => result.object));
        for (const result of results) connectors[result.meta.id] = result.meta;
    }

    return { space, connectors, towers: record };
}

/** World centre of one of a brick's argument grooves, once the brick is positioned. */
function slotCenter(node: TowerNode, slotIndex: number): Point {
    const input = node.model.getConnectorCoords().inputs[slotIndex];
    return { x: node.model.position.x + input.x, y: node.model.position.y + input.y };
}

/** The tower position that puts `root`'s output tab exactly on `point`. */
function positionOutputAt(root: TowerNode, point: Point): Point {
    const { output } = root.model.getConnectorCoords();
    return { x: point.x - output!.x, y: point.y - output!.y };
}

describe('resolveArgumentConnection', () => {
    describe('snap distance at each zoom level', () => {
        // The reach is half the probe box (37.5 / 50 / 62.5px) plus half the settled connector, so
        // an extra 44px falls between levels 1 and 2 and an extra 56px between levels 2 and 3.
        const LEVELS = [
            [1, 44, false],
            [2, 44, true],
            [2, 56, false],
            [3, 56, true],
        ] as const;

        const resolve = (settled: TowerNode, dragged: TowerNode, position: Point) => {
            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root: dragged, position },
            ]);
            return resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });
        };

        it.each(LEVELS)(
            'an output at level %i, %ipx past the slot, snaps: %s',
            (level, extra, snaps) => {
                const host = makeEmptyExpression('host', 1);
                host.model.setPosition(500, 500);
                const dragged = makeEmptyValue('dragged');
                dragged.model.scaleLevel = level;

                const slot = slotCenter(host, 0);
                const halfSlot = host.model.getConnectorCoords().inputs[0].w / 2;
                const position = positionOutputAt(dragged, {
                    x: slot.x + halfSlot + extra,
                    y: slot.y,
                });

                expect(resolve(host, dragged, position) !== null).toBe(snaps);
            },
        );
    });

    describe('dragging an argument onto a slot', () => {
        it('plugs the dragged tower into the slot it was dropped on', () => {
            const host = makeEmptyExpression('host', 1);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionOutputAt(dragged, slotCenter(host, 0)),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: host,
                child: dragged,
                slotIndex: 0,
                // The tower that owns the slot survives.
                hostTowerId: 'host-tower',
                absorbedTowerId: 'dragged-tower',
            });
        });

        it('snaps when the drop is merely near the groove, not exactly on it', () => {
            const host = makeEmptyExpression('host', 1);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyValue('dragged');
            const centre = slotCenter(host, 0);
            const near = positionOutputAt(dragged, { x: centre.x + 12, y: centre.y - 8 });

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root: dragged, position: near },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.slotIndex).toBe(0);
        });

        it('plugs into a statement brick too', () => {
            const host = makeEmptyStatement('host', 1);
            host.model.setPosition(600, 400);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 600, y: 400 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionOutputAt(dragged, slotCenter(host, 0)),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(host);
            expect(result?.slotIndex).toBe(0);
        });

        it('picks the nearest of several empty slots', () => {
            const host = makeEmptyExpression('host', 3);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionOutputAt(dragged, slotCenter(host, 2)),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.slotIndex).toBe(2);
        });

        it('skips an occupied slot', () => {
            const host = makeEmptyExpression('host', 1);
            host.model.setPosition(500, 500);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionOutputAt(dragged, slotCenter(host, 0)),
                },
            ]);

            // Filled after the space was seeded, so only the live graph knows the slot is taken.
            host.args[0] = makeEmptyValue('sitting-tenant');

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('never plugs into a slot the dragged tower already owns', () => {
            // An expression dragged over its own groove: it owns both connectors, so nothing joins.
            const dragged = makeEmptyExpression('dragged', 1);
            dragged.model.setPosition(500, 500);

            const { space, connectors, towers } = workspace([
                { id: 'dragged-tower', root: dragged, position: { x: 500, y: 500 } },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });
    });

    describe('either direction', () => {
        it('returns null when nothing is within snap distance', () => {
            const host = makeEmptyExpression('host', 1);
            const dragged = makeEmptyValue('dragged');

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root: dragged, position: { x: 2000, y: 2000 } },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('returns null when the dragged tower is no longer in the workspace', () => {
            const host = makeEmptyExpression('host', 1);

            const { space, connectors, towers } = workspace([
                { id: 'host-tower', root: host, position: { x: 500, y: 500 } },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'gone',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });
    });
});

describe('joinArg', () => {
    it('fills the slot and back-links the child to its parent', () => {
        const parent = makeEmptyExpression('parent', 2);
        const child = makeEmptyValue('child');

        joinArg({ parent, child, slotIndex: 1 });

        expect(parent.args[1]).toBe(child);
        expect(parent.args[0]).toBeNull();
        expect(child.parent).toBe(parent);
    });

    it('accepts an expression as the child, keeping its own arguments', () => {
        const parent = makeEmptyStatement('parent', 1);
        const child = makeEmptyExpression('child', 1);
        const leaf = makeEmptyValue('leaf');
        child.args[0] = leaf;

        joinArg({ parent, child, slotIndex: 0 });

        expect(parent.args[0]).toBe(child);
        expect(child.parent).toBe(parent);
        expect(child.args[0]).toBe(leaf);
    });
});
