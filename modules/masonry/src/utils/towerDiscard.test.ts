// Tests for discarding a tower dropped on the Trash. These drive the real workspace and layout
// stores rather than doubles, since what is being checked is precisely that the two are left
// consistent with each other: no connector points, and no layout entries, for bricks that are gone.

import { afterEach, describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';
import { joinStatement, resolveStatementConnection } from '@/utils/statement-connect';
import { listNodes, traverseTopDown } from '@/utils/tower-traversal';

import { discardTower } from './towerDiscard';

// -------------------------------------------------------------------------------------------------

/** The connector ids a collision space still tracks, read through the index the space keys by id. */
function spaceIds(space: unknown): number[] {
    return [...(space as { _itemsById: Map<number, unknown> })._itemsById.keys()];
}

/** Brick ids named by the connector book-keeping of either kind. */
function connectedBrickIds(): string[] {
    const { statementConnectors, argumentConnectors } = useWorkspaceStore.getState();

    return [
        ...Object.values(statementConnectors).map((meta) => meta.brickId),
        ...Object.values(argumentConnectors).map((meta) => meta.brickId),
    ];
}

/**
 * A three-brick statement stack whose middle brick carries a value argument, so a discard has to
 * account for both a statement chain and an argument sub-tree.
 *
 * `traverseTopDown` gives every brick the absolute position the layout pass would, which the
 * connector extraction reads.
 */
function buildStack(prefix: string, origin: Point) {
    const head = makeEmptyStatement(`${prefix}-head`, 0);
    const middle = makeEmptyStatement(`${prefix}-middle`, 1);
    const tail = makeEmptyStatement(`${prefix}-tail`, 0);
    const arg = makeEmptyValue(`${prefix}-arg`);

    head.next = middle;
    middle.prev = head;
    middle.next = tail;
    tail.prev = middle;
    middle.args[0] = arg;
    arg.parent = middle;

    traverseTopDown(head, origin);

    return { head, middle, tail, arg };
}

/** Puts a tower on the workspace the way a settled layout does: entries seeded, connectors synced. */
function place(towerId: string, root: TowerNode, position: Point): string[] {
    const workspace = useWorkspaceStore.getState();
    workspace.createTower({ id: towerId, root, position });

    const brickIds = listNodes(root).map((node) => node.model.id);
    const layout = useBrickLayoutStore.getState();
    layout.setCoords(Object.fromEntries(brickIds.map((id) => [id, { x: 0, y: 0 }])));
    layout.setMounted(Object.fromEntries(brickIds.map((id) => [id, true])));
    layout.setPositioned(Object.fromEntries(brickIds.map((id) => [id, true])));

    workspace.syncStatementConnectors(towerId, root);
    workspace.syncArgumentConnectors(towerId, root);

    return brickIds;
}

/** The tower position that lands `root`'s `prev` groove on `point`, as a snapped drop would. */
function positionPrevAt(root: TowerStatementNode, point: Point): Point {
    const prev = root.model.getConnectorCoords().prev!;

    return { x: point.x - prev.x, y: point.y - prev.y };
}

/** World centre of a statement's free `next` tab. */
function nextTabCenter(node: TowerStatementNode): Point {
    const next = node.model.getConnectorCoords().next!;

    return { x: node.model.position.x + next.x, y: node.model.position.y + next.y };
}

afterEach(() => {
    const workspace = useWorkspaceStore.getState();
    workspace.statementCollisionSpace.reset();
    workspace.argumentCollisionSpace.reset();
    useWorkspaceStore.setState({ towers: {}, statementConnectors: {}, argumentConnectors: {} });
    useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
});

// -------------------------------------------------------------------------------------------------

describe('discardTower', () => {
    it('takes the tower off the workspace', () => {
        const { head } = buildStack('solo', { x: 400, y: 300 });
        place('solo-tower', head, { x: 400, y: 300 });

        expect(discardTower('solo-tower')).toBe(true);

        expect(useWorkspaceStore.getState().towers).toEqual({});
    });

    it('drops the layout entries of every brick in the tower, args and all', () => {
        const { head } = buildStack('solo', { x: 400, y: 300 });
        const brickIds = place('solo-tower', head, { x: 400, y: 300 });

        // The whole sub-tree, not just the root: four bricks including the argument.
        expect(brickIds).toHaveLength(4);
        expect(Object.keys(useBrickLayoutStore.getState().coords)).toHaveLength(4);

        discardTower('solo-tower');

        const { coords, mounted, positioned } = useBrickLayoutStore.getState();
        for (const id of brickIds) {
            expect(id in coords).toBe(false);
            expect(id in mounted).toBe(false);
            expect(id in positioned).toBe(false);
        }
    });

    it('leaves no connector point of the removed bricks in either Collision space', () => {
        const { head } = buildStack('solo', { x: 400, y: 300 });
        const brickIds = place('solo-tower', head, { x: 400, y: 300 });

        const workspace = useWorkspaceStore.getState();
        expect(Object.keys(workspace.statementConnectors).length).toBeGreaterThan(0);
        expect(Object.keys(workspace.argumentConnectors).length).toBeGreaterThan(0);
        const trackedBefore = [
            ...spaceIds(workspace.statementCollisionSpace),
            ...spaceIds(workspace.argumentCollisionSpace),
        ];
        expect(trackedBefore.length).toBeGreaterThan(0);

        discardTower('solo-tower');

        const after = useWorkspaceStore.getState();
        expect(after.statementConnectors).toEqual({});
        expect(after.argumentConnectors).toEqual({});
        expect(spaceIds(after.statementCollisionSpace)).toEqual([]);
        expect(spaceIds(after.argumentCollisionSpace)).toEqual([]);
        expect(connectedBrickIds()).not.toContain(brickIds[0]);
    });

    it('keeps the connector points and layout entries of the towers that stay', () => {
        const discarded = buildStack('discarded', { x: 200, y: 200 });
        const kept = buildStack('kept', { x: 1200, y: 900 });

        place('discarded-tower', discarded.head, { x: 200, y: 200 });
        const keptIds = place('kept-tower', kept.head, { x: 1200, y: 900 });

        const before = useWorkspaceStore.getState();
        const keptStatementIds = Object.values(before.statementConnectors)
            .filter((meta) => meta.towerId === 'kept-tower')
            .map((meta) => meta.id);
        const keptArgumentIds = Object.values(before.argumentConnectors)
            .filter((meta) => meta.towerId === 'kept-tower')
            .map((meta) => meta.id);

        discardTower('discarded-tower');

        const after = useWorkspaceStore.getState();
        expect(Object.keys(after.towers)).toEqual(['kept-tower']);
        expect(Object.keys(after.statementConnectors).map(Number).sort()).toEqual(
            keptStatementIds.sort(),
        );
        expect(Object.keys(after.argumentConnectors).map(Number).sort()).toEqual(
            keptArgumentIds.sort(),
        );

        const { coords } = useBrickLayoutStore.getState();
        for (const id of keptIds) expect(id in coords).toBe(true);
    });

    it('returns false and changes nothing for a tower that is already gone', () => {
        const { head } = buildStack('solo', { x: 400, y: 300 });
        place('solo-tower', head, { x: 400, y: 300 });

        const before = useWorkspaceStore.getState();
        const connectorCount =
            Object.keys(before.statementConnectors).length +
            Object.keys(before.argumentConnectors).length;

        // A tower absorbed by a join mid-drag is no longer there to discard.
        expect(discardTower('absorbed-already')).toBe(false);

        const after = useWorkspaceStore.getState();
        expect(Object.keys(after.towers)).toEqual(['solo-tower']);
        expect(
            Object.keys(after.statementConnectors).length +
                Object.keys(after.argumentConnectors).length,
        ).toBe(connectorCount);
        expect(Object.keys(useBrickLayoutStore.getState().coords)).toHaveLength(4);
    });

    describe('discarding a brick dragged out of a stack', () => {
        /**
         * Reproduces what a drag to the Trash does to a connected brick: `useBrickMove` detaches it
         * into its own tower at drag start, both towers re-sync as they re-lay out, and the drop
         * discards only the detached one.
         */
        function detachAndDiscard() {
            const stack = buildStack('stack', { x: 300, y: 300 });
            place('source-tower', stack.head, { x: 300, y: 300 });

            const detachedId = useWorkspaceStore
                .getState()
                .detachBrickToNewTower('source-tower', stack.middle.model.id, { x: 800, y: 700 });
            expect(detachedId).not.toBeNull();

            const workspace = useWorkspaceStore.getState();
            traverseTopDown(stack.middle, { x: 800, y: 700 });
            workspace.createTower({
                id: detachedId!,
                root: stack.middle,
                position: { x: 800, y: 700 },
            });
            workspace.syncStatementConnectors(detachedId!, stack.middle);
            workspace.syncArgumentConnectors(detachedId!, stack.middle);
            workspace.syncStatementConnectors('source-tower', stack.head);
            workspace.syncArgumentConnectors('source-tower', stack.head);

            expect(discardTower(detachedId!)).toBe(true);

            // The detach re-roots the source tower with a shallow copy of its head, so the live node
            // is the one in the store rather than the `head` built above; both share its model.
            const sourceRoot = useWorkspaceStore.getState().towers['source-tower']
                .root as TowerStatementNode;

            return { ...stack, sourceRoot };
        }

        it('removes the detached sub-tree and nothing above it', () => {
            const stack = detachAndDiscard();

            expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual(['source-tower']);

            const { coords } = useBrickLayoutStore.getState();
            expect(stack.head.model.id in coords).toBe(true);
            for (const node of [stack.middle, stack.tail, stack.arg]) {
                expect(node.model.id in coords).toBe(false);
            }
        });

        it('leaves no connector point of the discarded sub-tree behind', () => {
            const stack = detachAndDiscard();

            const named = connectedBrickIds();
            for (const node of [stack.middle, stack.tail, stack.arg]) {
                expect(named).not.toContain(node.model.id);
            }
            expect(named).toContain(stack.head.model.id);
        });

        it('leaves the tower it was detached from able to lay out', () => {
            const stack = detachAndDiscard();
            const source = useWorkspaceStore.getState().towers['source-tower'];

            const positioned = traverseTopDown(stack.sourceRoot, source.position);

            // The stump is the head alone, sitting at the tower's origin.
            expect(positioned.map((node) => node.model.id)).toEqual([stack.head.model.id]);
            expect(stack.head.model.position).toMatchObject({ x: 300, y: 300 });
        });

        it('leaves the tower it was detached from able to take a new connection', () => {
            const { sourceRoot } = detachAndDiscard();

            // The freed `next` tab is what the discarded brick used to occupy.
            expect(sourceRoot.next).toBeNull();

            const dropped = makeEmptyStatement('dropped', 0);
            const position = positionPrevAt(dropped, nextTabCenter(sourceRoot));
            traverseTopDown(dropped, position);
            place('dropped-tower', dropped, position);

            const workspace = useWorkspaceStore.getState();
            const connection = resolveStatementConnection({
                draggedTowerId: 'dropped-tower',
                space: workspace.statementCollisionSpace,
                connectors: workspace.statementConnectors,
                towers: workspace.towers,
            });

            expect(connection).toMatchObject({
                parent: sourceRoot,
                child: dropped,
                socket: 'next',
                hostTowerId: 'source-tower',
                absorbedTowerId: 'dropped-tower',
            });

            joinStatement(connection!);

            expect(sourceRoot.next).toBe(dropped);
            expect(dropped.prev).toBe(sourceRoot);
        });
    });
});
