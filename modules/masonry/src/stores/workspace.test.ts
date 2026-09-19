import { act } from '@testing-library/react';
import { vi } from 'vitest';

import { canExtractBrick, EXTRACTED_TOWER_OFFSET_X, useWorkspaceStore } from './workspace';
import { useBrickLayoutStore } from './brick';
import { useWorkspaceHistoryStore } from './history';
import {
    expressionTree,
    makeEmptyExpression,
    makeEmptyStatement,
    makeEmptyValue,
    statementTreeNoNesting,
    statementTreeWithNesting,
} from '@/mocks/tower';
import { exportWorkspace } from '@/utils/import-export';
import { listNodes, listVisibleNodes, traverseTopDown } from '@/utils/tower-traversal';
import type { Bounds, Point } from '@/@types/common.types';
import type { TowerExpressionNode, TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { BrickModel } from '@/models/brick';
import type { QuadtreeCollisionSpace } from '@/utils/collision';

describe('Workspace Store Collision Space', () => {
    beforeEach(() => {
        // Reset the store state before each test
        const store = useWorkspaceStore.getState();
        store.statementCollisionSpace.reset();
        store.argumentCollisionSpace.reset();
        act(() => {
            useWorkspaceStore.setState({
                towers: {},
                selectedBrickId: null,
                statementConnectors: {},
                argumentConnectors: {},
            });
        });
    });

    it('selects and clears a brick', () => {
        const store = useWorkspaceStore.getState();

        act(() => {
            store.selectBrick('brick-1');
        });
        expect(useWorkspaceStore.getState().selectedBrickId).toBe('brick-1');

        act(() => {
            useWorkspaceStore.getState().clearSelection();
        });
        expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
    });

    it('clears the selection when the selected tower is removed', () => {
        const root = makeEmptyStatement('selected-root', 0, false);

        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'selected-tower',
                root,
                position: { x: 0, y: 0 },
            });
            useWorkspaceStore.getState().selectBrick(root.model.id);
            useWorkspaceStore.getState().removeTower('selected-tower');
        });

        expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
    });

    it('keeps a selection that belongs to a tower other than the one removed', () => {
        const kept = makeEmptyStatement('kept-root', 0, false);
        const doomed = makeEmptyStatement('doomed-root', 0, false);

        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'kept-tower',
                root: kept,
                position: { x: 0, y: 0 },
            });
            useWorkspaceStore.getState().createTower({
                id: 'doomed-tower',
                root: doomed,
                position: { x: 0, y: 0 },
            });
            useWorkspaceStore.getState().selectBrick(kept.model.id);
            useWorkspaceStore.getState().removeTower('doomed-tower');
        });

        expect(useWorkspaceStore.getState().selectedBrickId).toBe('kept-root');
    });

    it('keeps the selection when a join moves the brick into the tower that absorbs it', () => {
        const host = makeEmptyStatement('host-root', 0, false);
        const dragged = makeEmptyStatement('dragged-root', 0, false);

        act(() => {
            const store = useWorkspaceStore.getState();

            store.createTower({ id: 'host-tower', root: host, position: { x: 0, y: 0 } });
            store.createTower({ id: 'dragged-tower', root: dragged, position: { x: 0, y: 0 } });
            store.selectBrick('dragged-root');

            // What a join does: splice the graphs together, then drop the emptied tower.
            host.next = dragged;
            dragged.prev = host;
            store.absorbTower('dragged-tower', 'host-tower');
        });

        // The brick is still on the canvas, just under a different tower, so it stays selected.
        expect(useWorkspaceStore.getState().selectedBrickId).toBe('dragged-root');
    });

    it('extracts and syncs statement connectors correctly', () => {
        const root = statementTreeNoNesting;

        // Setup initial dummy positions on the models for testing
        root.model.setPosition(100, 200);

        act(() => {
            useWorkspaceStore.getState().syncStatementConnectors('tower-1', root);
        });

        const state = useWorkspaceStore.getState();
        const connectors = Object.values(state.statementConnectors);

        // Should have found statement models and extracted 'prev' and 'next' notches
        expect(connectors.length).toBeGreaterThan(0);

        // Every connector should belong to tower-1
        for (const meta of connectors) {
            expect(meta.towerId).toBe('tower-1');
            expect(['prev', 'next', 'nestedNext']).toContain(meta.type);
        }
    });

    it('cleans up collision points when a tower is removed', () => {
        const root = statementTreeNoNesting;

        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'tower-to-remove',
                root: root,
                position: { x: 0, y: 0 },
            });
            useWorkspaceStore.getState().syncStatementConnectors('tower-to-remove', root);
        });

        let state = useWorkspaceStore.getState();
        expect(Object.keys(state.statementConnectors).length).toBeGreaterThan(0);

        act(() => {
            useWorkspaceStore.getState().removeTower('tower-to-remove');
        });

        state = useWorkspaceStore.getState();

        // Verify book-keeping is cleaned up
        expect(Object.keys(state.statementConnectors).length).toBe(0);

        // Verify collision space is clean
        const spaceObjects = (
            state.statementCollisionSpace as unknown as { _itemsById: Map<number, unknown> }
        )._itemsById.size;
        expect(spaceObjects).toBe(0);
    });

    it('extracts and syncs argument connectors correctly', () => {
        const root = expressionTree;

        // Spread node positions well inside the space so no connector lands near the origin and
        // gets dropped by the collision space's in-bounds check.
        listNodes(root).forEach((node, i) => node.model.setPosition(100 + i * 40, 200));

        act(() => {
            useWorkspaceStore.getState().syncArgumentConnectors('tower-1', root);
        });

        const connectors = Object.values(useWorkspaceStore.getState().argumentConnectors);

        // Expression/value bricks yield input and output connectors.
        expect(connectors.length).toBeGreaterThan(0);

        for (const meta of connectors) {
            expect(meta.towerId).toBe('tower-1');
            expect(['input', 'output']).toContain(meta.type);
            // Inputs are addressable by slot index; outputs carry none.
            if (meta.type === 'input') expect(typeof meta.slotIndex).toBe('number');
            else expect(meta.slotIndex).toBeUndefined();
        }

        // Both connector kinds are present in this tree of expressions and values.
        expect(connectors.some((m) => m.type === 'input')).toBe(true);
        expect(connectors.some((m) => m.type === 'output')).toBe(true);
    });

    it('cleans up argument collision points when a tower is removed', () => {
        const root = expressionTree;
        listNodes(root).forEach((node, i) => node.model.setPosition(100 + i * 40, 200));

        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'arg-tower-to-remove',
                root,
                position: { x: 0, y: 0 },
            });
            useWorkspaceStore.getState().syncArgumentConnectors('arg-tower-to-remove', root);
        });

        expect(Object.keys(useWorkspaceStore.getState().argumentConnectors).length).toBeGreaterThan(
            0,
        );

        act(() => {
            useWorkspaceStore.getState().removeTower('arg-tower-to-remove');
        });

        const state = useWorkspaceStore.getState();
        expect(Object.keys(state.argumentConnectors).length).toBe(0);

        const spaceObjects = (
            state.argumentCollisionSpace as unknown as { _itemsById: Map<number, unknown> }
        )._itemsById.size;
        expect(spaceObjects).toBe(0);
    });

    it('detaches a brick to a new tower correctly', () => {
        const root = statementTreeNoNesting;
        const secondNode = root.next!;
        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'tower-1',
                root: root,
                position: { x: 0, y: 0 },
            });
        });

        let newTowerId: string | null = null;
        act(() => {
            newTowerId = useWorkspaceStore
                .getState()
                .detachBrickToNewTower('tower-1', secondNode.model.id, { x: 50, y: 50 });
        });

        expect(newTowerId).toBeTruthy();

        const state = useWorkspaceStore.getState();
        const oldTower = state.towers['tower-1'];
        const newTower = state.towers[newTowerId!];

        // The old tower should have the link severed
        expect((oldTower.root as TowerStatementNode).next).toBeNull();

        // The new tower should be created at the requested position with the detached node as root
        expect(newTower.position).toEqual({ x: 50, y: 50 });
        expect(newTower.root.model.id).toBe(secondNode.model.id);

        // The prev link on the newly detached root should be null
        expect((newTower.root as TowerStatementNode).prev).toBeNull();
    });

    it('detaches an argument brick to a new tower correctly', () => {
        const root = expressionTree;
        const firstArg = root.args[0]!;
        act(() => {
            useWorkspaceStore.getState().createTower({
                id: 'tower-expr-1',
                root: root,
                position: { x: 0, y: 0 },
            });
        });

        let newTowerId: string | null = null;
        act(() => {
            newTowerId = useWorkspaceStore
                .getState()
                .detachBrickToNewTower('tower-expr-1', firstArg.model.id, { x: 80, y: 80 });
        });

        expect(newTowerId).toBeTruthy();

        const state = useWorkspaceStore.getState();
        const oldTower = state.towers['tower-expr-1'];
        const newTower = state.towers[newTowerId!];

        // The old tower should have the argument slot cleared to null
        expect((oldTower.root as TowerExpressionNode).args[0]).toBeNull();

        // The new tower should be created at the requested position with the detached arg as root
        expect(newTower.position).toEqual({ x: 80, y: 80 });
        expect(newTower.root.model.id).toBe(firstArg.model.id);

        // The parent link on the newly detached root should be null
        expect((newTower.root as TowerExpressionNode).parent).toBeNull();
    });

    describe('detaching a folded brick', () => {
        /**
         * A stack whose middle brick is a folded clamp, holding a second folded clamp of its own.
         * Two levels deep, so a detach has to carry a fold nested inside a fold.
         */
        function setupFoldedStack() {
            const head = makeEmptyStatement('head', 0);
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inner = makeEmptyStatement('inner', 0, true);
            const deep = makeEmptyStatement('deep', 0);
            const tail = makeEmptyStatement('tail', 0);

            head.next = clamp;
            clamp.prev = head;
            clamp.next = tail;
            tail.prev = clamp;
            clamp.nestedNext = inner;
            inner.prev = clamp;
            inner.nestedNext = deep;
            deep.prev = inner;

            clamp.model.isNestingFolded = true;
            inner.model.isNestingFolded = true;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded',
                    root: head,
                    position: { x: 100, y: 100 },
                });
            });

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore
                    .getState()
                    .detachBrickToNewTower('tower-folded', 'clamp', { x: 400, y: 300 });
            });

            return { head, clamp, inner, deep, tail, newTowerId: newTowerId! };
        }

        it('carries the bricks the fold hides into the new tower', () => {
            const { clamp, inner, deep, newTowerId } = setupFoldedStack();

            const detached = useWorkspaceStore.getState().towers[newTowerId];

            expect(detached.root).toBe(clamp);
            // A fold hides a sub-tree; it never detaches it, so the pick-up takes the whole thing.
            expect(clamp.nestedNext).toBe(inner);
            expect(inner.nestedNext).toBe(deep);
            expect(
                listNodes(detached.root)
                    .map((node) => node.model.id)
                    .sort(),
            ).toEqual(['clamp', 'deep', 'inner', 'tail']);
        });

        it('keeps every fold state it carried, nested folds included', () => {
            const { clamp, inner, newTowerId } = setupFoldedStack();

            const detached = useWorkspaceStore.getState().towers[newTowerId];

            expect(clamp.model.isNestingFolded).toBe(true);
            expect(inner.model.isNestingFolded).toBe(true);
            // Still one brick on screen, exactly as the fold left it before the drag.
            expect(
                listVisibleNodes(detached.root)
                    .map((node) => node.model.id)
                    .sort(),
            ).toEqual(['clamp', 'tail']);
        });

        it('leaves the stump behind with nothing of the folded sub-tree in it', () => {
            const { head, newTowerId } = setupFoldedStack();

            const source = useWorkspaceStore.getState().towers['tower-folded'];

            expect(source.root.model).toBe(head.model);
            expect((source.root as TowerStatementNode).next).toBeNull();
            expect(listNodes(source.root)).toHaveLength(1);
            expect(newTowerId).toBeTruthy();
        });
    });

    describe('duplicateBrickToNewTower', () => {
        /**
         * A fresh 3-statement chain, each carrying one value arg. The shared mock trees are
         * severed by the detach tests above, so a duplication test must build its own.
         */
        function buildFreshChain(): TowerStatementNode {
            const statements = [
                makeEmptyStatement('st1', 1),
                makeEmptyStatement('st2', 1),
                makeEmptyStatement('st3', 1),
            ];
            statements.forEach((statement, index) => {
                statement.prev = statements[index - 1] ?? null;
                statement.next = statements[index + 1] ?? null;
                const arg = makeEmptyValue(`v${index + 1}`);
                statement.args[0] = arg;
                arg.parent = statement;
            });
            return statements[0];
        }

        /** Positions every node of a tower and creates it, with both connector spaces synced. */
        function placeTower(id: string, root: TowerNode, position: Point) {
            traverseTopDown(root, position);
            act(() => {
                const store = useWorkspaceStore.getState();
                store.createTower({ id, root, position });
                store.syncStatementConnectors(id, root);
                store.syncArgumentConnectors(id, root);
            });
        }

        /** A brick's kind and config in one line, so two trees compare by shape, not ids. */
        function fingerprint(node: TowerNode): string {
            const model = node.model;
            const widget = (model.widget as { type: string }).type;
            const params = 'params' in model ? [...model.params].join('|') : '';
            return `${node.kind}:${model.colorsDefault.background}:${widget}:${model.scaleLevel}:${params}`;
        }

        it('builds a fresh tower offset from the selected brick with the same shape', () => {
            const root = buildFreshChain();
            placeTower('source', root, { x: 100, y: 200 });
            const target = root.next as TowerStatementNode; // Mid-chain: the copy must carry st3.
            target.model.setPosition(100, 260);

            let copyId: string | null = null;
            act(() => {
                copyId = useWorkspaceStore.getState().duplicateBrickToNewTower(target.model.id);
            });

            const state = useWorkspaceStore.getState();
            expect(copyId).not.toBeNull();
            expect(Object.keys(state.towers)).toEqual(['source', copyId]);

            const copy = state.towers[copyId!];
            expect(copy.position).toEqual({ x: 160, y: 300 });
            expect(listNodes(copy.root).map(fingerprint)).toEqual(
                listNodes(target).map(fingerprint),
            );
        });

        it('mints every id afresh, the tower id included', () => {
            const root = buildFreshChain();
            placeTower('source', root, { x: 100, y: 200 });
            const target = root.next as TowerStatementNode;

            let copyId: string | null = null;
            act(() => {
                copyId = useWorkspaceStore.getState().duplicateBrickToNewTower(target.model.id);
            });

            const state = useWorkspaceStore.getState();
            expect(copyId).not.toBe('source');

            const copyIds = listNodes(state.towers[copyId!].root).map((node) => node.model.id);
            const sourceIds = listNodes(target).map((node) => node.model.id);
            expect(copyIds.some((id) => sourceIds.includes(id))).toBe(false);
            expect(new Set(copyIds).size).toBe(copyIds.length);
        });

        it('preserves the fold state of the copied bricks', () => {
            const outer = makeEmptyStatement('outer', 0, true);
            const inner = makeEmptyStatement('inner', 0, true);
            outer.nestedNext = inner;
            outer.model.isNestingFolded = true;
            inner.model.isNestingFolded = true;
            placeTower('source', outer, { x: 100, y: 100 });

            let copyId: string | null = null;
            act(() => {
                copyId = useWorkspaceStore.getState().duplicateBrickToNewTower('outer');
            });

            const copyRoot = useWorkspaceStore.getState().towers[copyId!]
                .root as TowerStatementNode;
            expect(copyRoot.model.isNestingFolded).toBe(true);
            expect((copyRoot.nestedNext as TowerStatementNode).model.isNestingFolded).toBe(true);
        });

        it('leaves the source tower and its connector points untouched', () => {
            const root = buildFreshChain();
            placeTower('source', root, { x: 100, y: 200 });
            const target = root.next as TowerStatementNode;
            const sourceConnectorIds = () => {
                const state = useWorkspaceStore.getState();
                return {
                    statement: Object.values(state.statementConnectors)
                        .filter((meta) => meta.towerId === 'source')
                        .map((meta) => meta.id),
                    argument: Object.values(state.argumentConnectors)
                        .filter((meta) => meta.towerId === 'source')
                        .map((meta) => meta.id),
                };
            };
            const before = sourceConnectorIds();
            expect(before.statement.length).toBeGreaterThan(0);
            expect(before.argument.length).toBeGreaterThan(0);

            act(() => {
                useWorkspaceStore.getState().duplicateBrickToNewTower(target.model.id);
            });

            const state = useWorkspaceStore.getState();
            // Same tower, same root reference, same position, same bricks.
            expect(state.towers['source'].root).toBe(root);
            expect(state.towers['source'].position).toEqual({ x: 100, y: 200 });
            expect(listNodes(state.towers['source'].root).map((node) => node.model.id)).toEqual(
                listNodes(root).map((node) => node.model.id),
            );
            // Same connector points.
            expect(sourceConnectorIds()).toEqual(before);
        });

        it('registers the copy in both collision spaces once it is laid out', () => {
            const root = buildFreshChain();
            placeTower('source', root, { x: 100, y: 200 });
            const target = root.next as TowerStatementNode;

            let copyId: string | null = null;
            act(() => {
                copyId = useWorkspaceStore.getState().duplicateBrickToNewTower(target.model.id);
            });

            // Connector sync is layout-driven: unpositioned copies carry no collision points yet.
            const stateBeforeLayout = useWorkspaceStore.getState();
            expect(
                Object.values(stateBeforeLayout.statementConnectors).some(
                    (meta) => meta.towerId === copyId,
                ),
            ).toBe(false);
            expect(
                Object.values(stateBeforeLayout.argumentConnectors).some(
                    (meta) => meta.towerId === copyId,
                ),
            ).toBe(false);

            // The copy's bricks start unpositioned — the layout does that on mount. Position them
            // the way `useTowerLayout` would, then re-sync as the layout-driven pass would.
            const copy = stateBeforeLayout.towers[copyId!];
            traverseTopDown(copy.root, copy.position);
            act(() => {
                const store = useWorkspaceStore.getState();
                store.syncStatementConnectors(copyId!, copy.root);
                store.syncArgumentConnectors(copyId!, copy.root);
            });

            const state = useWorkspaceStore.getState();
            expect(
                Object.values(state.statementConnectors).some((meta) => meta.towerId === copyId),
            ).toBe(true);
            expect(
                Object.values(state.argumentConnectors).some((meta) => meta.towerId === copyId),
            ).toBe(true);
        });

        it('returns null and changes nothing for an unknown brick id', () => {
            const root = buildFreshChain();
            placeTower('source', root, { x: 100, y: 200 });
            const towersBefore = useWorkspaceStore.getState().towers;

            let copyId: string | null = 'not-null';
            act(() => {
                copyId = useWorkspaceStore.getState().duplicateBrickToNewTower('no-such-brick');
            });

            expect(copyId).toBeNull();
            expect(useWorkspaceStore.getState().towers).toBe(towersBefore);
        });
    });

    describe('absorbTower', () => {
        /** Two towers, the dragged one already spliced into the host's empty slot by `joinArg`. */
        function setupJoined() {
            const host = makeEmptyExpression('host', 1);
            const dragged = makeEmptyValue('dragged');

            listNodes(host).forEach((node, i) => node.model.setPosition(500 + i * 40, 300));
            dragged.model.setPosition(900, 300);

            act(() => {
                const store = useWorkspaceStore.getState();
                store.createTower({ id: 'host-tower', root: host, position: { x: 500, y: 300 } });
                store.createTower({
                    id: 'dragged-tower',
                    root: dragged,
                    position: { x: 900, y: 300 },
                });
                store.syncArgumentConnectors('host-tower', host);
                store.syncArgumentConnectors('dragged-tower', dragged);
            });

            // The join itself is `joinArg`'s job; the store only merges what it produced.
            host.args[0] = dragged;
            dragged.parent = host;

            return { host, dragged };
        }

        it('drops the absorbed tower and keeps its bricks reachable from the host', () => {
            const { host, dragged } = setupJoined();

            act(() => {
                useWorkspaceStore.getState().absorbTower('dragged-tower', 'host-tower');
            });

            const state = useWorkspaceStore.getState();

            expect(state.towers['dragged-tower']).toBeUndefined();
            expect(state.towers['host-tower']).toBeDefined();

            // The dragged brick is now part of the host tower's tree, so it still renders.
            const hostNodeIds = listNodes(state.towers['host-tower'].root).map(
                (node) => node.model.id,
            );
            expect(hostNodeIds).toContain(dragged.model.id);
            expect(hostNodeIds).toContain(host.model.id);
        });

        it('replaces the host root reference so the layout re-runs', () => {
            const { host } = setupJoined();
            const before = useWorkspaceStore.getState().towers['host-tower'].root;

            act(() => {
                useWorkspaceStore.getState().absorbTower('dragged-tower', 'host-tower');
            });

            const after = useWorkspaceStore.getState().towers['host-tower'].root;

            expect(after).not.toBe(before);
            // Same brick, same position — only the reference is new.
            expect(after.model.id).toBe(host.model.id);
            expect(useWorkspaceStore.getState().towers['host-tower'].position).toEqual({
                x: 500,
                y: 300,
            });
        });

        it("purges the absorbed tower's connector points", () => {
            setupJoined();

            expect(
                Object.values(useWorkspaceStore.getState().argumentConnectors).some(
                    (meta) => meta.towerId === 'dragged-tower',
                ),
            ).toBe(true);

            act(() => {
                useWorkspaceStore.getState().absorbTower('dragged-tower', 'host-tower');
            });

            expect(
                Object.values(useWorkspaceStore.getState().argumentConnectors).some(
                    (meta) => meta.towerId === 'dragged-tower',
                ),
            ).toBe(false);
        });

        it('leaves the workspace untouched when the host tower is gone', () => {
            setupJoined();

            act(() => {
                const store = useWorkspaceStore.getState();
                store.removeTower('host-tower');
                store.absorbTower('dragged-tower', 'host-tower');
            });

            expect(Object.keys(useWorkspaceStore.getState().towers)).toEqual([]);
        });
    });

    describe('importWorkspace', () => {
        /** A payload as it would arrive from a file: exported, then through JSON text. */
        function payload() {
            return JSON.parse(
                JSON.stringify(
                    exportWorkspace({
                        source: {
                            id: 'source',
                            root: statementTreeWithNesting,
                            position: { x: 10, y: 20 },
                        },
                    }),
                ),
            );
        }

        /** Seeds a settled workspace: one tower, its connectors synced, its layout recorded. */
        function setupSettled(): string[] {
            const brickIds = listNodes(statementTreeNoNesting).map((node) => node.model.id);

            act(() => {
                const store = useWorkspaceStore.getState();
                store.createTower({
                    id: 'existing',
                    root: statementTreeNoNesting,
                    position: { x: 0, y: 0 },
                });
                store.syncStatementConnectors('existing', statementTreeNoNesting);
                store.syncArgumentConnectors('existing', statementTreeNoNesting);

                const layout = useBrickLayoutStore.getState();
                layout.setCoords(Object.fromEntries(brickIds.map((id) => [id, { x: 1, y: 1 }])));
                layout.setMounted(Object.fromEntries(brickIds.map((id) => [id, true])));
                layout.setPositioned(Object.fromEntries(brickIds.map((id) => [id, true])));
            });

            return brickIds;
        }

        beforeEach(() => {
            act(() => {
                useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
            });
        });

        it('replaces the workspace with the imported project', () => {
            setupSettled();

            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });

            const towers = Object.values(useWorkspaceStore.getState().towers);
            expect(towers).toHaveLength(1);
            expect(towers[0].id).not.toBe('existing');
            expect(towers[0].position).toEqual({ x: 10, y: 20 });
            expect(listNodes(towers[0].root)).toHaveLength(
                listNodes(statementTreeWithNesting).length,
            );
        });

        it('purges the collision points and book-keeping of the towers it replaced', () => {
            setupSettled();
            expect(
                Object.keys(useWorkspaceStore.getState().statementConnectors).length,
            ).toBeGreaterThan(0);

            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });

            const state = useWorkspaceStore.getState();
            expect(state.towers['existing']).toBeUndefined();
            expect(
                Object.values(state.statementConnectors).filter((m) => m.towerId === 'existing'),
            ).toEqual([]);
            expect(
                Object.values(state.argumentConnectors).filter((m) => m.towerId === 'existing'),
            ).toEqual([]);
        });

        it('drops the layout entries of every brick it replaced', () => {
            const staleIds = setupSettled();

            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });

            const layout = useBrickLayoutStore.getState();
            for (const id of staleIds) {
                expect(layout.coords[id]).toBeUndefined();
                expect(layout.mounted[id]).toBeUndefined();
                expect(layout.positioned[id]).toBeUndefined();
            }
        });

        it('gives the imported bricks ids no stale layout entry can shadow', () => {
            // The mock trees share brick ids, so preserving them would have the purge above delete
            // the very entries the new bricks need. Minted ids cannot collide either way.
            const staleIds = new Set(setupSettled());

            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });

            const towers = Object.values(useWorkspaceStore.getState().towers);
            const importedIds = towers.flatMap((t) => listNodes(t.root).map((n) => n.model.id));
            expect(importedIds.some((id) => staleIds.has(id))).toBe(false);

            const layout = useBrickLayoutStore.getState();
            for (const id of importedIds) {
                expect(layout.positioned[id]).toBeUndefined();
            }
        });

        it('reinitializes cleanly when the same project is imported twice', () => {
            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });
            const firstIds = Object.values(useWorkspaceStore.getState().towers).flatMap((t) =>
                listNodes(t.root).map((n) => n.model.id),
            );
            act(() => {
                const layout = useBrickLayoutStore.getState();
                layout.setPositioned(Object.fromEntries(firstIds.map((id) => [id, true])));
            });

            act(() => {
                useWorkspaceStore.getState().importWorkspace(payload());
            });

            const state = useWorkspaceStore.getState();
            expect(Object.keys(state.towers)).toHaveLength(1);

            const layout = useBrickLayoutStore.getState();
            for (const id of firstIds) {
                expect(layout.positioned[id]).toBeUndefined();
            }
            const secondIds = Object.values(state.towers).flatMap((t) =>
                listNodes(t.root).map((n) => n.model.id),
            );
            expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
        });

        it('leaves the workspace untouched when the payload is invalid', () => {
            const staleIds = setupSettled();
            const before = useWorkspaceStore.getState();
            const towersBefore = before.towers;
            const connectorsBefore = before.statementConnectors;

            expect(() =>
                useWorkspaceStore.getState().importWorkspace({ version: 1, towers: [], nodes: 7 }),
            ).toThrow(/importWorkspace:/);

            // Identity, not equality: a rejected import must not have written to the store at all.
            const after = useWorkspaceStore.getState();
            expect(after.towers).toBe(towersBefore);
            expect(after.statementConnectors).toBe(connectorsBefore);

            const layout = useBrickLayoutStore.getState();
            for (const id of staleIds) {
                expect(layout.positioned[id]).toBe(true);
            }
        });
    });

    describe('refreshTowerLayouts', () => {
        /** Two independent towers, as a scale change would find them. */
        function setupTwoTowers() {
            act(() => {
                const store = useWorkspaceStore.getState();
                store.createTower({
                    id: 'tower-a',
                    root: makeEmptyStatement('a', 1, true),
                    position: { x: 120, y: 80 },
                });
                store.createTower({
                    id: 'tower-b',
                    root: makeEmptyExpression('b', 2),
                    position: { x: 640, y: 300 },
                });
            });
        }

        it('replaces every tower root reference so each layout re-runs', () => {
            setupTwoTowers();
            const before = useWorkspaceStore.getState().towers;
            const rootsBefore = { a: before['tower-a'].root, b: before['tower-b'].root };

            act(() => {
                useWorkspaceStore.getState().refreshTowerLayouts();
            });

            const after = useWorkspaceStore.getState().towers;

            expect(after['tower-a'].root).not.toBe(rootsBefore.a);
            expect(after['tower-b'].root).not.toBe(rootsBefore.b);
            // Same bricks either side — only the reference is new.
            expect(after['tower-a'].root.model).toBe(rootsBefore.a.model);
            expect(after['tower-b'].root.model).toBe(rootsBefore.b.model);
        });

        it('keeps each tower anchored, position identity included', () => {
            setupTwoTowers();
            const before = useWorkspaceStore.getState().towers;
            const positionsBefore = {
                a: before['tower-a'].position,
                b: before['tower-b'].position,
            };

            act(() => {
                useWorkspaceStore.getState().refreshTowerLayouts();
            });

            const after = useWorkspaceStore.getState().towers;

            // Identity, not just value: `useTowerLayout`'s origin fast-path keys on `origin.x`/
            // `origin.y`, so a new object here would re-position the tower mid-relayout.
            expect(after['tower-a'].position).toBe(positionsBefore.a);
            expect(after['tower-b'].position).toBe(positionsBefore.b);
            expect(after['tower-a'].position).toEqual({ x: 120, y: 80 });
            expect(after['tower-b'].position).toEqual({ x: 640, y: 300 });
        });

        it('does nothing on an empty workspace', () => {
            act(() => {
                useWorkspaceStore.getState().refreshTowerLayouts();
            });

            expect(useWorkspaceStore.getState().towers).toEqual({});
        });
    });

    describe('setNestingFold', () => {
        /** A nesting brick holding a two-brick chain, with a brick following it. */
        function setupFoldableTower() {
            const outer = makeEmptyStatement('outer', 0, true);
            const inner = makeEmptyStatement('inner', 0, false);
            const innerNext = makeEmptyStatement('inner-next', 0, false);
            const tail = makeEmptyStatement('tail', 0, false);

            outer.nestedNext = inner;
            inner.prev = outer;
            inner.next = innerNext;
            innerNext.prev = inner;
            outer.next = tail;
            tail.prev = outer;

            act(() => {
                useBrickLayoutStore.setState({
                    coords: {},
                    mounted: {},
                    positioned: Object.fromEntries(
                        listNodes(outer).map((node) => [node.model.id, true]),
                    ),
                });
                useWorkspaceStore.getState().createTower({
                    id: 'tower-f',
                    root: outer,
                    position: { x: 200, y: 150 },
                });
            });

            return { outer, inner, innerNext, tail };
        }

        it('flips the flag and re-seats the tower so its layout re-runs', () => {
            const { outer } = setupFoldableTower();
            const before = useWorkspaceStore.getState().towers['tower-f'].root;

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });

            const after = useWorkspaceStore.getState().towers['tower-f'].root;

            expect(outer.model.isNestingFolded).toBe(true);
            // Re-seating the root is the whole signal: `useTowerLayout` re-runs off it and the
            // canvas re-lists what the fold leaves on screen.
            expect(after).not.toBe(before);
            expect(after.model).toBe(before.model);
        });

        it('keeps the tower anchored, position identity included', () => {
            setupFoldableTower();
            const before = useWorkspaceStore.getState().towers['tower-f'].position;

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });

            const after = useWorkspaceStore.getState().towers['tower-f'].position;

            // A fold moves the bricks below the cavity, never the tower: a new object here would
            // trip the layout's origin fast-path.
            expect(after).toBe(before);
            expect(after).toEqual({ x: 200, y: 150 });
        });

        it('leaves the graph and the fold states of the hidden bricks alone', () => {
            const { outer, inner, innerNext } = setupFoldableTower();

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });

            expect(outer.nestedNext).toBe(inner);
            expect(inner.next).toBe(innerNext);
            expect(listNodes(useWorkspaceStore.getState().towers['tower-f'].root)).toHaveLength(4);
        });

        it('does nothing when the brick is already in that state', () => {
            setupFoldableTower();

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });
            const folded = useWorkspaceStore.getState().towers['tower-f'].root;

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });

            // A re-seat costs a full re-layout of the tower, so a write that changes nothing must
            // not trigger one.
            expect(useWorkspaceStore.getState().towers['tower-f'].root).toBe(folded);
        });

        it('ignores an unknown brick and one that cannot fold', () => {
            setupFoldableTower();
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-v',
                    root: makeEmptyValue('lone-value'),
                    position: { x: 0, y: 0 },
                });
            });

            const before = useWorkspaceStore.getState().towers;

            act(() => {
                useWorkspaceStore.getState().setNestingFold('absent', true);
                useWorkspaceStore.getState().setNestingFold('lone-value', true);
            });

            expect(useWorkspaceStore.getState().towers).toBe(before);
        });

        it('hides the bricks a lifted fold hands back until the layout places them', () => {
            const { inner, innerNext } = setupFoldableTower();

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });
            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', false);
            });

            // They come back at whatever position they held when the cavity shut, which the tower
            // may have moved away from since; `positioned` is what `TowerBrick` hides behind until
            // the pass that follows places them.
            const { positioned } = useBrickLayoutStore.getState();
            expect(positioned[inner.model.id]).toBe(false);
            expect(positioned[innerNext.model.id]).toBe(false);
            // The fold never hid the brick itself or what follows it, so neither flickers.
            expect(positioned['outer']).toBe(true);
            expect(positioned['tail']).toBe(true);
        });

        it('leaves the layout entries alone while shutting a cavity', () => {
            setupFoldableTower();
            const before = useBrickLayoutStore.getState().positioned;

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
            });

            // Nothing new comes on screen, so there is nothing to hide.
            expect(useBrickLayoutStore.getState().positioned).toBe(before);
        });

        it('holds back only what is on screen inside the cavity', () => {
            const { inner, innerNext } = setupFoldableTower();

            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', true);
                // A fold inside a folded cavity: `inner-next` stays hidden by it after the outer
                // one is lifted, so it is not a brick coming back on screen.
                inner.nestedNext = innerNext;
                inner.next = null;
                inner.model.isNestingFolded = true;
            });
            act(() => {
                useWorkspaceStore.getState().setNestingFold('outer', false);
            });

            const { positioned } = useBrickLayoutStore.getState();
            expect(positioned[inner.model.id]).toBe(false);
            expect(positioned[innerNext.model.id]).toBe(true);
        });
    });

    describe('connector points after a scale change', () => {
        /** A statement carrying a value in its one slot, so both collision spaces have work to do. */
        function setupScaledTower() {
            const root = makeEmptyStatement('scaled', 1, false);
            const arg = makeEmptyValue('scaled-arg');
            root.args[0] = arg;
            arg.parent = root;

            for (const node of listNodes(root)) {
                node.model.widgetDims = { w: 40, h: 14 };
            }

            /** Lays the tower out at `level`, the way `useTowerLayout` would, and re-syncs. */
            function layoutAt(level: 1 | 2 | 3) {
                for (const node of listNodes(root)) {
                    node.model.scaleLevel = level;
                }
                arg.model.computeDims();
                root.model.argDims = [{ w: arg.model.dims.w, h: arg.model.dims.h }];
                root.model.computeOutline();

                root.model.setPosition(300, 200);
                const slot = root.model.bounds.args![0]!;
                arg.model.setPosition(300 + slot.x, 200 + slot.y);

                act(() => {
                    const store = useWorkspaceStore.getState();
                    store.syncStatementConnectors('scaled-tower', root);
                    store.syncArgumentConnectors('scaled-tower', root);
                });
            }

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'scaled-tower',
                    root,
                    position: { x: 300, y: 200 },
                });
            });

            return { root, arg, layoutAt };
        }

        /** Ids in `space` whose registered box covers `point`. */
        function hitsAt(space: QuadtreeCollisionSpace, point: Point): number[] {
            return space.checkCollision({ id: -1, x: point.x, y: point.y, w: 1, h: 1 });
        }

        /** World point of a brick's connector, as the collision space should have recorded it. */
        function worldPoint(model: BrickModel, bounds: Bounds): Point {
            return { x: model.position.x + bounds.x, y: model.position.y + bounds.y };
        }

        it('holds the statement points at their new co-ordinates', () => {
            const { root, layoutAt } = setupScaledTower();

            layoutAt(2);
            const before = root.model.getConnectorCoords();

            layoutAt(3);
            const after = root.model.getConnectorCoords();
            const state = useWorkspaceStore.getState();
            const metas = Object.values(state.statementConnectors);

            // The notches genuinely moved, so agreeing with them is a real assertion.
            expect(after.prev!.y).not.toBeCloseTo(before.prev!.y, 6);
            expect(metas.length).toBeGreaterThan(0);

            for (const meta of metas) {
                const point = worldPoint(root.model, after[meta.type]!);
                expect(hitsAt(state.statementCollisionSpace, point)).toContain(meta.id);
            }
        });

        it('holds the argument points at their new co-ordinates', () => {
            const { root, arg, layoutAt } = setupScaledTower();

            layoutAt(2);
            const beforeInput = root.model.getConnectorCoords().inputs[0];

            layoutAt(1);
            const afterInput = root.model.getConnectorCoords().inputs[0];
            const afterOutput = arg.model.getConnectorCoords().output!;
            const state = useWorkspaceStore.getState();
            const metas = Object.values(state.argumentConnectors);

            expect(afterInput.x).not.toBeCloseTo(beforeInput.x, 6);
            expect(metas.some((meta) => meta.type === 'input')).toBe(true);
            expect(metas.some((meta) => meta.type === 'output')).toBe(true);

            for (const meta of metas) {
                const owner = meta.brickId === arg.model.id ? arg.model : root.model;
                const bounds = meta.type === 'output' ? afterOutput : afterInput;
                const hits = hitsAt(state.argumentCollisionSpace, worldPoint(owner, bounds));
                expect(hits).toContain(meta.id);
            }
        });

        it('leaves no stale points behind from the previous level', () => {
            const { layoutAt } = setupScaledTower();

            layoutAt(2);
            const atDefault = {
                statement: Object.keys(useWorkspaceStore.getState().statementConnectors).length,
                argument: Object.keys(useWorkspaceStore.getState().argumentConnectors).length,
            };

            layoutAt(1);
            layoutAt(3);

            // Each sync replaces the tower's points rather than adding a fresh set beside them.
            expect(Object.keys(useWorkspaceStore.getState().statementConnectors).length).toBe(
                atDefault.statement,
            );
            expect(Object.keys(useWorkspaceStore.getState().argumentConnectors).length).toBe(
                atDefault.argument,
            );
        });
    });

    describe('extractBrickToNewTower', () => {
        function expectGraphAcyclic(root: TowerNode) {
            const visited = new Set<TowerNode>();
            const stack: TowerNode[] = [root];
            while (stack.length > 0) {
                const node = stack.pop()!;
                expect(visited.has(node)).toBe(false);
                visited.add(node);
                if (node.kind === 'statement') {
                    if (node.next) stack.push(node.next);
                    if (node.nestedNext) stack.push(node.nestedNext);
                }
                if (node.kind === 'statement' || node.kind === 'expression') {
                    for (const arg of node.args) {
                        if (arg) stack.push(arg);
                    }
                }
            }
        }

        function expectPointersConsistent(root: TowerNode) {
            if (root.kind === 'statement') {
                expect(root.prev).toBeNull();
            }
            const stack: TowerNode[] = [root];
            while (stack.length > 0) {
                const node = stack.pop()!;
                if (node.kind === 'statement') {
                    if (node.next) {
                        if ('prev' in node.next) {
                            expect(node.next.prev?.model.id).toBe(node.model.id);
                        }
                        stack.push(node.next);
                    }
                    if (node.nestedNext) {
                        if ('prev' in node.nestedNext) {
                            expect(node.nestedNext.prev?.model.id).toBe(node.model.id);
                        }
                        stack.push(node.nestedNext);
                    }
                }
                if (node.kind === 'statement' || node.kind === 'expression') {
                    for (const arg of node.args) {
                        if (arg) {
                            if ('parent' in arg) {
                                expect(arg.parent?.model.id).toBe(node.model.id);
                            }
                            stack.push(arg);
                        }
                    }
                }
            }
        }

        function verifyNodeConservation(
            originalNodes: TowerNode[],
            ...towerRoots: (TowerNode | undefined | null)[]
        ) {
            const originalIds = originalNodes.map((n) => n.model.id).sort();
            const validRoots = towerRoots.filter((r): r is TowerNode => Boolean(r));
            const afterNodes = validRoots.flatMap((r) => listNodes(r));
            const afterIds = afterNodes.map((n) => n.model.id).sort();

            // 1. Total node count matches
            expect(afterIds.length).toBe(originalIds.length);
            // 2. Exact same set of IDs
            expect(afterIds).toEqual(originalIds);
            // 3. No duplicates within or across towers
            const uniqueIds = new Set(afterIds);
            expect(uniqueIds.size).toBe(afterIds.length);
            // 4. Traversal terminates without cycles for all resultant towers
            // 5. Bidirectional pointer consistency holds (next.prev == node, parent == node, root.prev == null)
            for (const root of validRoots) {
                expectGraphAcyclic(root);
                expectPointersConsistent(root);
            }
        }

        it('extracts an intermediate brick from a normal chain and splices the gap', () => {
            const a = makeEmptyStatement('a', 0);
            const b = makeEmptyStatement('b', 0);
            const c = makeEmptyStatement('c', 0);

            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-chain',
                    root: a,
                    position: { x: 50, y: 50 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-chain'];
            const newTower = state.towers[newTowerId!];

            // Gap closed in old tower
            expect((oldTower.root as TowerStatementNode).next).toBe(c);
            expect(c.prev).toBe(a);
            expect(c.next).toBeNull();

            // Extracted brick is isolated root of new tower
            expect(newTower.root).toBe(b);
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();

            // Node conservation & acyclicity
            verifyNodeConservation([a, b, c], oldTower.root, newTower.root);
        });

        it('extracts a brick with a cavity, preserving its internal cavity and closing outer chain gap', () => {
            const a = makeEmptyStatement('a', 0);
            const b = makeEmptyStatement('b', 0, true);
            const c = makeEmptyStatement('c', 0);
            const d = makeEmptyStatement('d', 0);
            const e = makeEmptyStatement('e', 0);

            a.next = b;
            b.prev = a;
            b.next = e;
            e.prev = b;

            b.nestedNext = c;
            c.prev = b;
            c.next = d;
            d.prev = c;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-cavity',
                    root: a,
                    position: { x: 50, y: 50 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-cavity'];
            const newTower = state.towers[newTowerId!];

            // Old tower bridges a directly to e
            expect((oldTower.root as TowerStatementNode).next).toBe(e);
            expect(e.prev).toBe(a);
            expect(e.next).toBeNull();

            // Extracted brick b retains its cavity c -> d
            expect(newTower.root).toBe(b);
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(c);
            expect(c.prev).toBe(b);
            expect(c.next).toBe(d);
            expect(d.prev).toBe(c);

            // Node conservation & acyclicity
            verifyNodeConservation([a, b, c, d, e], oldTower.root, newTower.root);
        });

        it('extracts a cavity head brick', () => {
            const parent = makeEmptyStatement('parent', 0, true);
            const b = makeEmptyStatement('b', 0);
            const c = makeEmptyStatement('c', 0);
            const d = makeEmptyStatement('d', 0);

            parent.nestedNext = b;
            b.prev = parent;
            b.next = c;
            c.prev = b;
            c.next = d;
            d.prev = c;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-cavity-head',
                    root: parent,
                    position: { x: 50, y: 50 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-cavity-head'];
            const newTower = state.towers[newTowerId!];

            // Parent cavity now begins with c
            expect((oldTower.root as TowerStatementNode).nestedNext).toBe(c);
            expect(c.prev).toBe(parent);
            expect(c.next).toBe(d);
            expect(d.prev).toBe(c);

            expect(newTower.root).toBe(b);
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();

            // Node conservation & acyclicity
            verifyNodeConservation([parent, b, c, d], oldTower.root, newTower.root);
        });

        it('extracts a root brick and preserves the original tower position', () => {
            const b = makeEmptyStatement('b', 0);
            const c = makeEmptyStatement('c', 0);

            b.next = c;
            c.prev = b;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root',
                    root: b,
                    position: { x: 120, y: 250 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-root'];
            const newTower = state.towers[newTowerId!];

            // Old tower root is now c, prev is null
            expect(oldTower.root.model.id).toBe('c');
            expect((oldTower.root as TowerStatementNode).prev).toBeNull();
            // Position of old tower is PRESERVED
            expect(oldTower.position).toEqual({ x: 120, y: 250 });

            // New tower placed beside old tower
            expect(newTower.root.model.id).toBe('b');
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();
            expect(newTower.position).toEqual({
                x: 120 + EXTRACTED_TOWER_OFFSET_X,
                y: 250,
            });

            // Node conservation & acyclicity
            verifyNodeConservation([b, c], oldTower.root, newTower.root);
        });

        it('extracts a root brick that has a cavity and next', () => {
            const b = makeEmptyStatement('b', 0, true);
            const c = makeEmptyStatement('c', 0);
            const d = makeEmptyStatement('d', 0);
            const e = makeEmptyStatement('e', 0);

            b.next = e;
            e.prev = b;

            b.nestedNext = c;
            c.prev = b;
            c.next = d;
            d.prev = c;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root-cavity',
                    root: b,
                    position: { x: 100, y: 100 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-root-cavity'];
            const newTower = state.towers[newTowerId!];

            // e becomes the new root
            expect(oldTower.root.model.id).toBe('e');
            expect((oldTower.root as TowerStatementNode).prev).toBeNull();
            expect(oldTower.position).toEqual({ x: 100, y: 100 });

            // b is extracted to new tower, retaining its cavity c -> d
            expect(newTower.root.model.id).toBe('b');
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(c);
            expect(c.prev).toBe(b);
            expect(c.next).toBe(d);
            expect(d.prev).toBe(c);

            // Node conservation & acyclicity
            verifyNodeConservation([b, c, d, e], oldTower.root, newTower.root);
        });

        it('extracts a folded brick, taking its hidden cavity contents with it', () => {
            const a = makeEmptyStatement('a', 0);
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inner = makeEmptyStatement('inner', 0, true);
            const tail = makeEmptyStatement('tail', 0);

            a.next = clamp;
            clamp.prev = a;
            clamp.next = tail;
            tail.prev = clamp;

            clamp.nestedNext = inner;
            inner.prev = clamp;
            clamp.model.isNestingFolded = true;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded-extract',
                    root: a,
                    position: { x: 0, y: 0 },
                });
            });

            expect(canExtractBrick('clamp')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-folded-extract'];
            const newTower = state.towers[newTowerId!];

            // Old tower: a connects directly to tail
            expect((oldTower.root as TowerStatementNode).next).toBe(tail);
            expect(tail.prev).toBe(a);

            // New tower: clamp retains its hidden cavity
            expect(newTower.root.model.id).toBe('clamp');
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(inner);
            expect(inner.prev).toBe(clamp);
            expect(clamp.model.isNestingFolded).toBe(true);

            // Node conservation & acyclicity
            verifyNodeConservation([a, clamp, inner, tail], oldTower.root, newTower.root);
        });

        it('extracts a folded brick without duplication after tower absorption (Scenario D)', () => {
            const a = makeEmptyStatement('note-a', 0);
            const clamp = makeEmptyStatement('repeat-b', 0, true);
            const inner1 = makeEmptyStatement('inner-c', 0);
            const inner2 = makeEmptyStatement('inner-d', 0);

            clamp.nestedNext = inner1;
            inner1.prev = clamp;
            inner1.next = inner2;
            inner2.prev = inner1;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'host-tower',
                    root: a,
                    position: { x: 100, y: 100 },
                });
                useWorkspaceStore.getState().createTower({
                    id: 'dragged-tower',
                    root: clamp,
                    position: { x: 100, y: 200 },
                });
            });

            // Simulate snapping repeat below note: join and absorb
            a.next = clamp;
            clamp.prev = a;
            act(() => {
                useWorkspaceStore.getState().absorbTower('dragged-tower', 'host-tower');
            });

            // Fold repeat
            clamp.model.isNestingFolded = true;

            expect(canExtractBrick('repeat-b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('repeat-b');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const hostTower = state.towers['host-tower'];
            const newTower = state.towers[newTowerId!];

            // Host tower should only contain note-a, with next = null
            expect(hostTower.root.model.id).toBe('note-a');
            expect((hostTower.root as TowerStatementNode).next).toBeNull();

            // New tower should contain repeat-b with its folded contents
            expect(newTower.root.model.id).toBe('repeat-b');
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(inner1);
            expect((newTower.root as TowerStatementNode).next).toBeNull();
            expect((newTower.root as TowerStatementNode).model.isNestingFolded).toBe(true);

            // Node conservation & acyclicity
            verifyNodeConservation([a, clamp, inner1, inner2], hostTower.root, newTower.root);
        });

        it('extracts a folded root brick with an outer next chain', () => {
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inner = makeEmptyStatement('inner', 0);
            const tail = makeEmptyStatement('tail', 0);

            clamp.next = tail;
            tail.prev = clamp;
            clamp.nestedNext = inner;
            inner.prev = clamp;
            clamp.model.isNestingFolded = true;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded-root',
                    root: clamp,
                    position: { x: 200, y: 150 },
                });
            });

            expect(canExtractBrick('clamp')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-folded-root'];
            const newTower = state.towers[newTowerId!];

            // Old tower root is now tail
            expect(oldTower.root.model.id).toBe('tail');
            expect((oldTower.root as TowerStatementNode).prev).toBeNull();
            expect(oldTower.position).toEqual({ x: 200, y: 150 });

            // New tower is clamp with its hidden contents
            expect(newTower.root.model.id).toBe('clamp');
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(inner);

            // Node conservation & acyclicity
            verifyNodeConservation([clamp, inner, tail], oldTower.root, newTower.root);
        });

        it('disables extraction for no-op cases and leaves state completely immutable', () => {
            // Case 1: lone root statement
            const lone = makeEmptyStatement('lone', 0, false);
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-lone',
                    root: lone,
                    position: { x: 0, y: 0 },
                });
            });
            const towersBefore1 = useWorkspaceStore.getState().towers;
            const historyLenBefore1 = useWorkspaceHistoryStore.getState().history.length;

            expect(canExtractBrick('lone')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('lone')).toBeNull();

            // Strictly unchanged
            expect(useWorkspaceStore.getState().towers).toBe(towersBefore1);
            expect(useWorkspaceStore.getState().towers['tower-lone'].root).toBe(lone);
            expect(useWorkspaceHistoryStore.getState().history.length).toBe(historyLenBefore1);

            // Case 2: lone root with unfolded cavity but no outer next
            const rootWithCavity = makeEmptyStatement('root-cavity', 0, true);
            const innerUnfolded = makeEmptyStatement('inner-unfolded', 0);
            rootWithCavity.nestedNext = innerUnfolded;
            innerUnfolded.prev = rootWithCavity;
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root-no-next',
                    root: rootWithCavity,
                    position: { x: 0, y: 0 },
                });
            });
            const towersBefore2 = useWorkspaceStore.getState().towers;
            const historyLenBefore2 = useWorkspaceHistoryStore.getState().history.length;

            expect(canExtractBrick('root-cavity')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('root-cavity')).toBeNull();

            expect(useWorkspaceStore.getState().towers).toBe(towersBefore2);
            expect(useWorkspaceStore.getState().towers['tower-root-no-next'].root).toBe(
                rootWithCavity,
            );
            expect(useWorkspaceHistoryStore.getState().history.length).toBe(historyLenBefore2);

            // Case 3: folded root with no outer next
            const foldedLone = makeEmptyStatement('folded-lone', 0, true);
            const hidden = makeEmptyStatement('hidden', 0);
            foldedLone.nestedNext = hidden;
            hidden.prev = foldedLone;
            foldedLone.model.isNestingFolded = true;
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded-lone',
                    root: foldedLone,
                    position: { x: 0, y: 0 },
                });
            });
            const towersBefore3 = useWorkspaceStore.getState().towers;
            const historyLenBefore3 = useWorkspaceHistoryStore.getState().history.length;

            expect(canExtractBrick('folded-lone')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('folded-lone')).toBeNull();

            expect(useWorkspaceStore.getState().towers).toBe(towersBefore3);
            expect(useWorkspaceStore.getState().towers['tower-folded-lone'].root).toBe(foldedLone);
            expect(useWorkspaceHistoryStore.getState().history.length).toBe(historyLenBefore3);

            // Case 4: free-floating argument root
            const freeArg = makeEmptyExpression('free-arg', 1);
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-free-arg',
                    root: freeArg,
                    position: { x: 0, y: 0 },
                });
            });
            const towersBefore4 = useWorkspaceStore.getState().towers;
            const historyLenBefore4 = useWorkspaceHistoryStore.getState().history.length;

            expect(canExtractBrick('free-arg')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('free-arg')).toBeNull();

            expect(useWorkspaceStore.getState().towers).toBe(towersBefore4);
            expect(useWorkspaceStore.getState().towers['tower-free-arg'].root).toBe(freeArg);
            expect(useWorkspaceHistoryStore.getState().history.length).toBe(historyLenBefore4);

            // Case 5: non-existent brick
            const towersBefore5 = useWorkspaceStore.getState().towers;
            const historyLenBefore5 = useWorkspaceHistoryStore.getState().history.length;

            expect(canExtractBrick('non-existent')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('non-existent')).toBeNull();

            expect(useWorkspaceStore.getState().towers).toBe(towersBefore5);
            expect(useWorkspaceHistoryStore.getState().history.length).toBe(historyLenBefore5);
        });

        it('routes argument bricks to detachBrickToNewTower', () => {
            const root = makeEmptyStatement('stmt-with-arg', 1);
            const firstArg = makeEmptyExpression('arg-expr', 1);
            root.args[0] = firstArg;
            firstArg.parent = root;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-arg-extract',
                    root,
                    position: { x: 0, y: 0 },
                });
            });

            expect(canExtractBrick(firstArg.model.id)).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore
                    .getState()
                    .extractBrickToNewTower(firstArg.model.id, { x: 300, y: 300 });
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-arg-extract'];
            const newTower = state.towers[newTowerId!];

            expect((oldTower.root as TowerStatementNode).args[0]).toBeNull();
            expect(newTower.root.model.id).toBe(firstArg.model.id);
            expect(newTower.position).toEqual({ x: 300, y: 300 });

            // Node conservation & acyclicity
            verifyNodeConservation([root, firstArg], oldTower.root, newTower.root);
        });

        it('supports undo and redo of extraction with exactly one history commit', async () => {
            useWorkspaceHistoryStore.getState().clear();
            useWorkspaceHistoryStore.getState().init();

            const a = makeEmptyStatement('hist-a', 0);
            const b = makeEmptyStatement('hist-b', 0);
            const c = makeEmptyStatement('hist-c', 0);
            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-hist',
                    root: a,
                    position: { x: 0, y: 0 },
                });
            });
            useWorkspaceHistoryStore.getState().commit();

            const historyStoreBefore = useWorkspaceHistoryStore.getState();
            const historyLenBefore = historyStoreBefore.history.length;
            const currentIndexBefore = historyStoreBefore.currentIndex;

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('hist-b');
            });
            expect(newTowerId).toBeTruthy();

            // Wait for dynamic import and history commit
            await vi.dynamicImportSettled();

            // Assert EXACTLY ONE history commit was made
            const historyStoreAfter = useWorkspaceHistoryStore.getState();
            expect(historyStoreAfter.history.length).toBe(historyLenBefore + 1);
            expect(historyStoreAfter.currentIndex).toBe(currentIndexBefore + 1);

            expect(Object.keys(useWorkspaceStore.getState().towers)).toHaveLength(2);

            // Undo once reverts to original state completely
            act(() => {
                useWorkspaceHistoryStore.getState().undo();
            });

            const stateAfterUndo = useWorkspaceStore.getState();
            expect(Object.keys(stateAfterUndo.towers)).toHaveLength(1);
            const restoredTower = stateAfterUndo.towers['tower-hist'];
            expect(
                listNodes(restoredTower.root)
                    .map((n) => n.model.id)
                    .sort(),
            ).toEqual(['hist-a', 'hist-b', 'hist-c']);

            // Redo advances to extracted state
            act(() => {
                useWorkspaceHistoryStore.getState().redo();
            });

            const stateAfterRedo = useWorkspaceStore.getState();
            expect(Object.keys(stateAfterRedo.towers)).toHaveLength(2);
        });

        it('calculates safe bounding box placement clear of wide arguments', () => {
            // Setup a tower with root -> mid (expr with wide arg) -> tail
            const root = makeEmptyStatement('root-stmt', 0);
            const mid = makeEmptyStatement('mid-stmt', 1);
            const midArg = makeEmptyExpression('mid-expr', 1);
            const leafVal = makeEmptyValue('leaf-val');

            root.next = mid;
            mid.prev = root;
            mid.args[0] = midArg;
            midArg.parent = mid;
            midArg.args[0] = leafVal;
            leafVal.parent = midArg;

            // Set widths
            (root.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 100,
                h: 40,
            };
            (mid.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 100,
                h: 40,
            };
            (midArg.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 120,
                h: 30,
            };
            (leafVal.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 80,
                h: 25,
            };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-wide-args',
                    root,
                    position: { x: 100, y: 100 },
                });
                useBrickLayoutStore.getState().setCoords({
                    'root-stmt': { x: 100, y: 100 },
                    'mid-stmt': { x: 100, y: 140 },
                    'mid-expr': { x: 250, y: 145 },
                    'leaf-val': { x: 370, y: 150 },
                });
            });

            // Extract leaf-val
            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('leaf-val');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const newTower = state.towers[newTowerId!];

            // Rightmost edge of remaining tower: mid-expr at 250 + 120 = 370
            // Safe X must be at least maxTowerX + EXTRACTED_TOWER_MARGIN_X = 370 + 40 = 410
            expect(newTower.position.x).toBeGreaterThanOrEqual(410);
            expect(newTower.position.y).toBe(150);
        });

        it('extracts a container brick from a chain, preserving its nestingDims and cavity contents', () => {
            const a = makeEmptyStatement('stmt-a', 0);
            const clamp = makeEmptyStatement('clamp-container', 0, true);
            const b = makeEmptyStatement('stmt-b', 0);
            const child1 = makeEmptyStatement('child-1', 0);
            const child2 = makeEmptyStatement('child-2', 0);

            a.next = clamp;
            clamp.prev = a;
            clamp.next = b;
            b.prev = clamp;

            clamp.nestedNext = child1;
            child1.prev = clamp;
            child1.next = child2;
            child2.prev = child1;

            // Set nestingDims as if layout had run over children
            clamp.model.nestingDims = { w: 200, h: 100 };
            clamp.model.computeDims();
            const initialHeight = clamp.model.dims.h;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-clamp',
                    root: a,
                    position: { x: 50, y: 50 },
                });
            });

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp-container');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-clamp'];
            const newTower = state.towers[newTowerId!];

            // Old tower: a links directly to b
            expect((oldTower.root as TowerStatementNode).next).toBe(b);
            expect(b.prev).toBe(a);

            // Extracted container brick preserves its cavity contents and nestingDims
            expect(newTower.root.model.id).toBe('clamp-container');
            expect((newTower.root as TowerStatementNode).nestedNext).toBe(child1);
            expect((newTower.root as TowerStatementNode).model.nestingDims).toEqual({
                w: 200,
                h: 100,
            });
            expect(newTower.root.model.dims.h).toBe(initialHeight);

            // Node conservation & acyclicity
            verifyNodeConservation([a, clamp, b, child1, child2], oldTower.root, newTower.root);
        });

        it('resets positioned flags for extracted bricks in layout store', () => {
            const a = makeEmptyStatement('pos-a', 0);
            const b = makeEmptyStatement('pos-b', 0);
            a.next = b;
            b.prev = a;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-pos',
                    root: a,
                    position: { x: 50, y: 50 },
                });
                useBrickLayoutStore.getState().setPositioned({
                    'pos-a': true,
                    'pos-b': true,
                });
            });

            expect(useBrickLayoutStore.getState().positioned['pos-b']).toBe(true);

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('pos-b');
            });

            // Extracted brick's positioned flag is reset to false to prevent flashing at old coords
            expect(useBrickLayoutStore.getState().positioned['pos-b']).toBe(false);
        });

        it('extracts a root brick with next and places it clear of the promoted remaining tower with wide arguments', () => {
            // Setup root -> promotedRoot (with wide argument)
            const root = makeEmptyStatement('root-stmt', 0);
            const promoted = makeEmptyStatement('promoted-stmt', 1);
            const wideArg = makeEmptyValue('wide-arg');
            root.next = promoted;
            promoted.prev = root;
            promoted.args[0] = wideArg;
            wideArg.parent = promoted;

            (root.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 120,
                h: 40,
            };
            (promoted.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 150,
                h: 50,
            };
            (wideArg.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 100,
                h: 30,
            };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root-wide',
                    root,
                    position: { x: 400, y: 100 },
                });
                useBrickLayoutStore.getState().setCoords({
                    'root-stmt': { x: 400, y: 100 },
                    'promoted-stmt': { x: 400, y: 140 },
                    'wide-arg': { x: 550, y: 140 },
                });
            });

            // Extract root
            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('root-stmt');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-root-wide'];
            const newTower = state.towers[newTowerId!];

            // Promoted brick is now root
            expect(oldTower.root.model.id).toBe('promoted-stmt');

            // Rightmost edge of promoted remaining tower: wideArg at 550 + 100 = 650
            // Safe X must be at least maxTowerX + EXTRACTED_TOWER_MARGIN_X = 650 + 40 = 690
            expect(newTower.position.x).toBeGreaterThanOrEqual(690);
            expect(newTower.position.y).toBe(100);
        });

        it('resets cavity nestingDims when extracting the sole brick from a container cavity', () => {
            const clamp = makeEmptyStatement('outer-clamp', 0, true);
            const inner = makeEmptyStatement('inner-lone', 0);
            clamp.nestedNext = inner;
            inner.prev = clamp;
            clamp.model.nestingDims = { w: 120, h: 40 };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-cavity-sole',
                    root: clamp,
                    position: { x: 100, y: 100 },
                });
            });

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('inner-lone');
            });

            const state = useWorkspaceStore.getState();
            const remainingTower = state.towers['tower-cavity-sole'];
            const remainingClamp = remainingTower.root as TowerStatementNode;

            expect(remainingClamp.nestedNext).toBeNull();
            expect(remainingClamp.model.nestingDims).toBeNull();
        });

        it('recalculates cavity nestingDims when extracting the first brick of a multi-brick cavity', () => {
            const clamp = makeEmptyStatement('outer-clamp-multi', 0, true);
            const inner1 = makeEmptyStatement('inner-1', 0);
            const inner2 = makeEmptyStatement('inner-2', 0);
            clamp.nestedNext = inner1;
            inner1.prev = clamp;
            inner1.next = inner2;
            inner2.prev = inner1;

            (inner1.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 100,
                h: 30,
            };
            (inner2.model as unknown as { _dims: { w: number; h: number } })._dims = {
                w: 140,
                h: 50,
            };
            clamp.model.nestingDims = { w: 140, h: 80 };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-cavity-multi',
                    root: clamp,
                    position: { x: 100, y: 100 },
                });
            });

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('inner-1');
            });

            const state = useWorkspaceStore.getState();
            const remainingTower = state.towers['tower-cavity-multi'];
            const remainingClamp = remainingTower.root as TowerStatementNode;

            expect(remainingClamp.nestedNext).toBe(inner2);
            expect(inner2.prev).toBe(clamp);
            expect(remainingClamp.model.nestingDims).toEqual({ w: 140, h: 50 });
        });

        it('resets positioned flags and parent argDims when extracting an argument brick', () => {
            const stmt = makeEmptyStatement('stmt-host', 1);
            const arg = makeEmptyValue('extracted-arg');
            stmt.args[0] = arg;
            arg.parent = stmt;
            stmt.model.argDims = [{ w: 60, h: 30 }];

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-arg-host',
                    root: stmt,
                    position: { x: 150, y: 150 },
                });
                useBrickLayoutStore.getState().setPositioned({
                    'stmt-host': true,
                    'extracted-arg': true,
                });
            });

            expect(useBrickLayoutStore.getState().positioned['extracted-arg']).toBe(true);

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('extracted-arg');
            });

            const state = useWorkspaceStore.getState();
            const hostTower = state.towers['tower-arg-host'];
            const hostStmt = hostTower.root as TowerStatementNode;

            expect(hostStmt.args[0]).toBeNull();
            expect(hostStmt.model.argDims[0]).toBeNull();

            // positioned flag for the extracted argument brick must be set to false to prevent visual flashing
            expect(useBrickLayoutStore.getState().positioned['extracted-arg']).toBe(false);
        });

        it('extracts a nested brick containing both argument children and cavity children', () => {
            // start
            //   └─ cavity:
            //        note1 [arg: div1 (/ 1 4)]
            //          ├─ cavity: pitch1 [sol, 4]
            //          └─ next: note2 [arg: div2 (/ 1 2)]
            //               └─ cavity: pitch2 [sol, 4]
            const start = makeEmptyStatement('start', 0, true);
            const note1 = makeEmptyStatement('note1', 1, true);
            const div1 = makeEmptyExpression('div1', 2);
            const pitch1 = makeEmptyStatement('pitch1', 2);

            const note2 = makeEmptyStatement('note2', 1, true);
            const div2 = makeEmptyExpression('div2', 2);
            const pitch2 = makeEmptyStatement('pitch2', 2);

            // Connect start -> note1
            start.nestedNext = note1;
            note1.prev = start;

            // Note 1 args and cavity
            note1.args[0] = div1;
            div1.parent = note1;
            note1.nestedNext = pitch1;
            pitch1.prev = note1;

            // Note 1 next -> Note 2
            note1.next = note2;
            note2.prev = note1;

            // Note 2 args and cavity
            note2.args[0] = div2;
            div2.parent = note2;
            note2.nestedNext = pitch2;
            pitch2.prev = note2;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-music',
                    root: start,
                    position: { x: 50, y: 50 },
                });
            });

            expect(canExtractBrick('note1')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('note1');
            });

            expect(newTowerId).toBeTruthy();
            const state = useWorkspaceStore.getState();
            const oldTower = state.towers['tower-music'];
            const newTower = state.towers[newTowerId!];

            // In old tower: start's cavity head becomes note2, and note2.prev points back to start!
            expect((oldTower.root as TowerStatementNode).nestedNext).toBe(note2);
            expect(note2.prev).toBe(start);
            expect(note2.next).toBeNull();
            expect(note2.args[0]).toBe(div2);
            expect(note2.nestedNext).toBe(pitch2);

            // In new tower: note1 extracted WITH both its arguments (div1) and cavity (pitch1)!
            expect(newTower.root).toBe(note1);
            expect(note1.prev).toBeNull();
            expect(note1.next).toBeNull();
            expect(note1.args[0]).toBe(div1);
            expect(note1.nestedNext).toBe(pitch1);
            expect(pitch1.prev).toBe(note1);

            // Node conservation & acyclicity
            verifyNodeConservation(
                [start, note1, div1, pitch1, note2, div2, pitch2],
                oldTower.root,
                newTower.root,
            );
        });

        it('supports repeated extraction on the same tower without node loss or cycles', () => {
            // A -> B -> C -> D
            const a = makeEmptyStatement('chain-a', 0);
            const b = makeEmptyStatement('chain-b', 0);
            const c = makeEmptyStatement('chain-c', 0);
            const d = makeEmptyStatement('chain-d', 0);

            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;
            c.next = d;
            d.prev = c;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-chain-multi',
                    root: a,
                    position: { x: 100, y: 100 },
                });
            });

            // 1. Extract B: leaves A -> C -> D
            const bTowerId = useWorkspaceStore.getState().extractBrickToNewTower('chain-b');
            expect(bTowerId).toBeTruthy();

            const state1 = useWorkspaceStore.getState();
            const tower1 = state1.towers['tower-chain-multi'];
            expect((tower1.root as TowerStatementNode).next).toBe(c);
            expect(c.prev).toBe(a);
            expect(c.next).toBe(d);
            expect(d.prev).toBe(c);

            // 2. Extract C: leaves A -> D
            const cTowerId = useWorkspaceStore.getState().extractBrickToNewTower('chain-c');
            expect(cTowerId).toBeTruthy();

            const state2 = useWorkspaceStore.getState();
            const tower2 = state2.towers['tower-chain-multi'];
            expect(((tower2.root as TowerStatementNode).next as TowerStatementNode).model.id).toBe(
                'chain-d',
            );
            expect((d.prev as TowerStatementNode).model.id).toBe('chain-a');
            expect(d.next).toBeNull();

            // All nodes accounted for across the 3 towers, no duplicates, no cycles
            verifyNodeConservation(
                [a, b, c, d],
                tower2.root,
                state2.towers[bTowerId!].root,
                state2.towers[cTowerId!].root,
            );
        });

        it('handles interleaved extraction and drag operations correctly', () => {
            // A -> B -> C -> D
            const a = makeEmptyStatement('ab-a', 0);
            const b = makeEmptyStatement('ab-b', 0);
            const c = makeEmptyStatement('ab-c', 0);
            const d = makeEmptyStatement('ab-d', 0);

            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;
            c.next = d;
            d.prev = c;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-interleave',
                    root: a,
                    position: { x: 100, y: 100 },
                });
            });

            // 1. Extract B: leaves A -> C -> D in original tower
            const bTowerId = useWorkspaceStore.getState().extractBrickToNewTower('ab-b');
            expect(bTowerId).toBeTruthy();

            // 2. Drag C via detachBrickToNewTower: severs C -> D from A, leaving A alone
            const cTowerId = useWorkspaceStore
                .getState()
                .detachBrickToNewTower('tower-interleave', 'ab-c', { x: 300, y: 300 });
            expect(cTowerId).toBeTruthy();

            const state = useWorkspaceStore.getState();
            const originalTower = state.towers['tower-interleave'];
            const draggedTower = state.towers[cTowerId!];
            const extractedTower = state.towers[bTowerId!];

            // Original tower has only A
            expect(originalTower.root.model.id).toBe('ab-a');
            expect((originalTower.root as TowerStatementNode).next).toBeNull();

            // Dragged tower has C -> D (downstream preserved by drag)
            expect(draggedTower.root.model.id).toBe('ab-c');
            expect((draggedTower.root as TowerStatementNode).prev).toBeNull(); // detached root has prev = null
            expect((draggedTower.root as TowerStatementNode).next).toBe(d);
            expect(d.prev).toBe(c);

            // Extracted tower has only B
            expect(extractedTower.root.model.id).toBe('ab-b');
            expect((extractedTower.root as TowerStatementNode).next).toBeNull();
            expect((extractedTower.root as TowerStatementNode).prev).toBeNull();

            // Node conservation & acyclicity
            verifyNodeConservation(
                [a, b, c, d],
                originalTower.root,
                draggedTower.root,
                extractedTower.root,
            );
        });
    });
});
