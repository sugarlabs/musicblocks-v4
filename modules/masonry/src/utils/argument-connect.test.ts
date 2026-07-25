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

/** The tower position that puts `root`'s argument groove exactly on `point`. */
function positionSlotAt(root: TowerNode, slotIndex: number, point: Point): Point {
    const input = root.model.getConnectorCoords().inputs[slotIndex];
    return { x: point.x - input.x, y: point.y - input.y };
}

describe('resolveArgumentConnection', () => {
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

    describe('dragging a slot onto an argument', () => {
        it('picks up the settled brick the dragged slot was dropped on', () => {
            const settled = makeEmptyValue('settled');
            settled.model.setPosition(500, 500);
            const dragged = makeEmptyExpression('dragged', 1);
            const { output } = settled.model.getConnectorCoords();
            const outputCentre = { x: 500 + output!.x, y: 500 + output!.y };

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionSlotAt(dragged, 0, outputCentre),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toMatchObject({
                parent: dragged,
                child: settled,
                slotIndex: 0,
                // The tower that owns the slot survives, which this time is the dragged one.
                hostTowerId: 'dragged-tower',
                absorbedTowerId: 'settled-tower',
            });
        });

        it('works when the slot owner is a statement brick', () => {
            const settled = makeEmptyValue('settled');
            settled.model.setPosition(500, 500);
            const dragged = makeEmptyStatement('dragged', 2);
            const { output } = settled.model.getConnectorCoords();
            const outputCentre = { x: 500 + output!.x, y: 500 + output!.y };

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionSlotAt(dragged, 1, outputCentre),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(dragged);
            expect(result?.child).toBe(settled);
            expect(result?.slotIndex).toBe(1);
        });

        it('refuses a brick that is already filling another brick’s slot', () => {
            // `tenant` is not its tower's root, so its output tab is already spoken for. It sits
            // well away from `owner` so that only its own output tab is near the probe.
            const owner = makeEmptyExpression('owner', 1);
            const tenant = makeEmptyValue('tenant');
            owner.args[0] = tenant;
            tenant.parent = owner;
            owner.model.setPosition(500, 500);
            tenant.model.setPosition(900, 700);

            const dragged = makeEmptyExpression('dragged', 1);
            const { output } = tenant.model.getConnectorCoords();
            const tenantOutput = { x: 900 + output!.x, y: 700 + output!.y };

            const { space, connectors, towers } = workspace([
                { id: 'owner-tower', root: owner, position: { x: 500, y: 500 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionSlotAt(dragged, 0, tenantOutput),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result).toBeNull();
        });

        it('offers a slot from anywhere in the dragged tower, not just its root', () => {
            const settled = makeEmptyValue('settled');
            settled.model.setPosition(500, 500);

            // A dragged tower two deep: the root's slot is taken, its child's slot is free.
            const root = makeEmptyExpression('root', 1);
            const inner = makeEmptyExpression('inner', 1);
            root.args[0] = inner;
            inner.parent = root;

            const { output } = settled.model.getConnectorCoords();
            const outputCentre = { x: 500 + output!.x, y: 500 + output!.y };

            // The inner brick sits at this fixed offset within the dragged tower, as its layout
            // would place it. Position the tower so the inner brick's groove lands on the output.
            const INNER_OFFSET = { x: 40, y: 10 };
            const input = inner.model.getConnectorCoords().inputs[0];
            const draggedPosition = {
                x: outputCentre.x - INNER_OFFSET.x - input.x,
                y: outputCentre.y - INNER_OFFSET.y - input.y,
            };
            inner.model.setPosition(
                draggedPosition.x + INNER_OFFSET.x,
                draggedPosition.y + INNER_OFFSET.y,
            );

            const { space, connectors, towers } = workspace([
                { id: 'settled-tower', root: settled, position: { x: 500, y: 500 } },
                { id: 'dragged-tower', root, position: draggedPosition },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(inner);
            expect(result?.child).toBe(settled);
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

        it('prefers the closer pairing when a dragged expression could join either way', () => {
            // The dragged expression has both an output tab and a free slot. A value sits right on
            // its slot, while a host's slot is far from its output tab, so the pick-up must win.
            const value = makeEmptyValue('value');
            value.model.setPosition(500, 500);
            const host = makeEmptyExpression('host', 1);
            host.model.setPosition(900, 900);

            const dragged = makeEmptyExpression('dragged', 1);
            const { output } = value.model.getConnectorCoords();

            const { space, connectors, towers } = workspace([
                { id: 'value-tower', root: value, position: { x: 500, y: 500 } },
                { id: 'host-tower', root: host, position: { x: 900, y: 900 } },
                {
                    id: 'dragged-tower',
                    root: dragged,
                    position: positionSlotAt(dragged, 0, {
                        x: 500 + output!.x,
                        y: 500 + output!.y,
                    }),
                },
            ]);

            const result = resolveArgumentConnection({
                draggedTowerId: 'dragged-tower',
                space,
                connectors,
                towers,
            });

            expect(result?.parent).toBe(dragged);
            expect(result?.child).toBe(value);
            expect(result?.hostTowerId).toBe('dragged-tower');
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
