import { act } from '@testing-library/react';

import {
    canExtractBrick,
    calculateExtractedTowerPosition,
    EXTRACTED_TOWER_MARGIN_X,
    EXTRACTED_TOWER_OFFSET_X,
    useWorkspaceStore,
} from './workspace';
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
import type { TowerState } from '@/@types/workspace.types';
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
                    id: 'source-tower',
                    root: a,
                    position: { x: 100, y: 100 },
                });
            });

            expect(canExtractBrick('b')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('b');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['source-tower'];
            const newTower = towers[newTowerId!];

            expect(sourceTower.root.model.id).toBe('a');
            expect((sourceTower.root as TowerStatementNode).next?.model.id).toBe('c');
            expect(c.prev?.model.id).toBe('a');

            expect(newTower.root.model.id).toBe('b');
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);

            const allNodeIds = [
                ...listNodes(sourceTower.root).map((n) => n.model.id),
                ...listNodes(newTower.root).map((n) => n.model.id),
            ].sort();
            expect(allNodeIds).toEqual(['a', 'b', 'c']);
        });

        it('extracts a brick with a cavity, preserving its internal cavity and closing outer chain gap', () => {
            const a = makeEmptyStatement('a', 0);
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inner1 = makeEmptyStatement('inner-1', 0);
            const inner2 = makeEmptyStatement('inner-2', 0);
            const c = makeEmptyStatement('c', 0);

            a.next = clamp;
            clamp.prev = a;
            clamp.next = c;
            c.prev = clamp;

            clamp.nestedNext = inner1;
            inner1.prev = clamp;
            inner1.next = inner2;
            inner2.prev = inner1;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'source-tower-cavity',
                    root: a,
                    position: { x: 50, y: 50 },
                });
            });

            expect(canExtractBrick('clamp')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['source-tower-cavity'];
            const newTower = towers[newTowerId!];

            expect(sourceTower.root.model.id).toBe('a');
            expect((sourceTower.root as TowerStatementNode).next?.model.id).toBe('c');
            expect(c.prev?.model.id).toBe('a');

            expect(newTower.root.model.id).toBe('clamp');
            const newRoot = newTower.root as TowerStatementNode;
            expect(newRoot.prev).toBeNull();
            expect(newRoot.next).toBeNull();
            expect(newRoot.nestedNext?.model.id).toBe('inner-1');
            expect((newRoot.nestedNext as TowerStatementNode).next?.model.id).toBe('inner-2');
            expect(inner1.prev?.model.id).toBe('clamp');
            expect(inner2.prev?.model.id).toBe('inner-1');

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);

            const allNodeIds = [
                ...listNodes(sourceTower.root).map((n) => n.model.id),
                ...listNodes(newTower.root).map((n) => n.model.id),
            ].sort();
            expect(allNodeIds).toEqual(['a', 'c', 'clamp', 'inner-1', 'inner-2']);
        });

        it('extracts a cavity head brick', () => {
            const parent = makeEmptyStatement('parent', 0, true);
            const h1 = makeEmptyStatement('h1', 0);
            const h2 = makeEmptyStatement('h2', 0);

            parent.nestedNext = h1;
            h1.prev = parent;
            h1.next = h2;
            h2.prev = h1;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-cavity-head',
                    root: parent,
                    position: { x: 0, y: 0 },
                });
            });

            expect(canExtractBrick('h1')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('h1');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-cavity-head'];
            const newTower = towers[newTowerId!];

            expect((sourceTower.root as TowerStatementNode).nestedNext?.model.id).toBe('h2');
            expect(h2.prev?.model.id).toBe('parent');

            expect(newTower.root.model.id).toBe('h1');
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
        });

        it('extracts a root brick and preserves the original tower position', () => {
            const root = makeEmptyStatement('root-stmt', 0);
            const nextStmt = makeEmptyStatement('next-stmt', 0);
            root.next = nextStmt;
            nextStmt.prev = root;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root',
                    root,
                    position: { x: 150, y: 250 },
                });
            });

            expect(canExtractBrick('root-stmt')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('root-stmt');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-root'];
            const newTower = towers[newTowerId!];

            expect(sourceTower.position).toEqual({ x: 150, y: 250 });
            expect(sourceTower.root.model.id).toBe('next-stmt');
            expect((sourceTower.root as TowerStatementNode).prev).toBeNull();

            expect(newTower.root.model.id).toBe('root-stmt');
            expect((newTower.root as TowerStatementNode).prev).toBeNull();
            expect((newTower.root as TowerStatementNode).next).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
        });

        it('extracts a root brick that has a cavity and next', () => {
            const clampRoot = makeEmptyStatement('clamp-root', 0, true);
            const cavity1 = makeEmptyStatement('cavity-1', 0);
            const outerNext = makeEmptyStatement('outer-next', 0);

            clampRoot.nestedNext = cavity1;
            cavity1.prev = clampRoot;
            clampRoot.next = outerNext;
            outerNext.prev = clampRoot;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-root-cavity',
                    root: clampRoot,
                    position: { x: 100, y: 100 },
                });
            });

            expect(canExtractBrick('clamp-root')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp-root');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-root-cavity'];
            const newTower = towers[newTowerId!];

            expect(sourceTower.position).toEqual({ x: 100, y: 100 });
            expect(sourceTower.root.model.id).toBe('outer-next');
            expect((sourceTower.root as TowerStatementNode).prev).toBeNull();

            expect(newTower.root.model.id).toBe('clamp-root');
            const newRoot = newTower.root as TowerStatementNode;
            expect(newRoot.prev).toBeNull();
            expect(newRoot.next).toBeNull();
            expect(newRoot.nestedNext?.model.id).toBe('cavity-1');
            expect(cavity1.prev?.model.id).toBe('clamp-root');

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
        });

        it('extracts a folded brick, taking its hidden cavity contents with it', () => {
            const head = makeEmptyStatement('head', 0);
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inner = makeEmptyStatement('inner', 0);
            const tail = makeEmptyStatement('tail', 0);

            head.next = clamp;
            clamp.prev = head;
            clamp.next = tail;
            tail.prev = clamp;
            clamp.nestedNext = inner;
            inner.prev = clamp;

            clamp.model.isNestingFolded = true;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded-test',
                    root: head,
                    position: { x: 0, y: 0 },
                });
            });

            expect(canExtractBrick('clamp')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-folded-test'];
            const newTower = towers[newTowerId!];

            expect((sourceTower.root as TowerStatementNode).next?.model.id).toBe('tail');
            expect(tail.prev?.model.id).toBe('head');

            expect(newTower.root.model.id).toBe('clamp');
            const newRoot = newTower.root as TowerStatementNode;
            expect(newRoot.model.isNestingFolded).toBe(true);
            expect(newRoot.nestedNext?.model.id).toBe('inner');
            expect(inner.prev?.model.id).toBe('clamp');
            expect(newRoot.next).toBeNull();
            expect(newRoot.prev).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
        });

        it('extracts a folded root brick with an outer next chain', () => {
            const clamp = makeEmptyStatement('clamp-root-fold', 0, true);
            const inner = makeEmptyStatement('inner-fold', 0);
            const outerNext = makeEmptyStatement('outer-next-fold', 0);

            clamp.nestedNext = inner;
            inner.prev = clamp;
            clamp.next = outerNext;
            outerNext.prev = clamp;
            clamp.model.isNestingFolded = true;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-folded-root',
                    root: clamp,
                    position: { x: 200, y: 200 },
                });
            });

            expect(canExtractBrick('clamp-root-fold')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('clamp-root-fold');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-folded-root'];
            const newTower = towers[newTowerId!];

            expect(sourceTower.position).toEqual({ x: 200, y: 200 });
            expect(sourceTower.root.model.id).toBe('outer-next-fold');
            expect((sourceTower.root as TowerStatementNode).prev).toBeNull();

            expect(newTower.root.model.id).toBe('clamp-root-fold');
            const newRoot = newTower.root as TowerStatementNode;
            expect(newRoot.model.isNestingFolded).toBe(true);
            expect(newRoot.nestedNext?.model.id).toBe('inner-fold');
            expect(newRoot.next).toBeNull();
            expect(newRoot.prev).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
        });

        it('disables extraction for no-op cases and leaves state completely immutable', () => {
            // Case 1: lone root statement with no next
            const lone = makeEmptyStatement('lone', 0);
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-lone',
                    root: lone,
                    position: { x: 0, y: 0 },
                });
            });
            expect(canExtractBrick('lone')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('lone')).toBeNull();

            // Case 2: lone folded root statement with no next
            const loneFolded = makeEmptyStatement('lone-folded', 0, true);
            const loneInner = makeEmptyStatement('lone-inner', 0);
            loneFolded.nestedNext = loneInner;
            loneInner.prev = loneFolded;
            loneFolded.model.isNestingFolded = true;
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-lone-folded',
                    root: loneFolded,
                    position: { x: 0, y: 0 },
                });
            });
            expect(canExtractBrick('lone-folded')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('lone-folded')).toBeNull();

            // Case 3: unattached argument brick
            const unattachedArg = makeEmptyValue('unattached-val');
            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-unattached',
                    root: unattachedArg,
                    position: { x: 0, y: 0 },
                });
            });
            expect(canExtractBrick('unattached-val')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('unattached-val')).toBeNull();

            // Case 4: non-existent brick
            expect(canExtractBrick('non-existent')).toBe(false);
            expect(useWorkspaceStore.getState().extractBrickToNewTower('non-existent')).toBeNull();

            // Workspace towers count unchanged
            expect(Object.keys(useWorkspaceStore.getState().towers).length).toBe(3);
        });

        it('routes argument bricks to detachBrickToNewTower', () => {
            const stmt = makeEmptyStatement('stmt-with-arg', 1);
            const argExpr = makeEmptyExpression('arg-expr', 1);
            const childVal = makeEmptyValue('child-val');

            stmt.args[0] = argExpr;
            argExpr.parent = stmt;
            argExpr.args[0] = childVal;
            childVal.parent = argExpr;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-arg',
                    root: stmt,
                    position: { x: 100, y: 100 },
                });
            });

            expect(canExtractBrick('arg-expr')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('arg-expr');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-arg'];
            const newTower = towers[newTowerId!];

            expect((sourceTower.root as TowerStatementNode).args[0]).toBeNull();

            expect(newTower.root.model.id).toBe('arg-expr');
            expect((newTower.root as TowerExpressionNode).parent).toBeNull();
            expect((newTower.root as TowerExpressionNode).args[0]?.model.id).toBe('child-val');

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);
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

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('hist-b');
            });
            expect(newTowerId).toBeTruthy();

            // Wait for dynamic import and history commit
            await vi.dynamicImportSettled();

            const historyStoreAfter = useWorkspaceHistoryStore.getState();
            expect(historyStoreAfter.history.length).toBe(historyLenBefore + 1);

            // Undo
            act(() => {
                useWorkspaceHistoryStore.getState().undo();
            });

            const towersAfterUndo = useWorkspaceStore.getState().towers;
            expect(Object.keys(towersAfterUndo).length).toBe(1);
            expect(towersAfterUndo['tower-hist']).toBeDefined();
            const restoredRoot = towersAfterUndo['tower-hist'].root as TowerStatementNode;
            expect(restoredRoot.next?.model.id).toBe('hist-b');

            // Redo
            act(() => {
                useWorkspaceHistoryStore.getState().redo();
            });

            const towersAfterRedo = useWorkspaceStore.getState().towers;
            expect(Object.keys(towersAfterRedo).length).toBe(2);
            expect(
                (towersAfterRedo['tower-hist'].root as TowerStatementNode).next?.model.id,
            ).toBe('hist-c');
        });

        it('calculates safe bounding box placement clear of wide arguments', () => {
            const root = makeEmptyStatement('safe-root', 1);
            const wideArg = makeEmptyExpression('wide-arg', 0);
            Object.defineProperty(wideArg.model, 'dims', {
                value: { w: 350, h: 50 },
                configurable: true,
            });
            root.args[0] = wideArg;
            wideArg.parent = root;

            const nextStmt = makeEmptyStatement('safe-next', 0);
            root.next = nextStmt;
            nextStmt.prev = root;

            const tower: TowerState = {
                id: 'safe-tower',
                root,
                position: { x: 100, y: 100 },
            };

            const pos = calculateExtractedTowerPosition(tower, 'safe-next');
            expect(pos.x).toBeGreaterThanOrEqual(100 + 350 + EXTRACTED_TOWER_MARGIN_X);
        });

        it('resets cavity nestingDims when extracting the sole brick from a container cavity', () => {
            const clamp = makeEmptyStatement('outer-clamp', 0, true);
            const inner = makeEmptyStatement('sole-inner', 0);
            clamp.nestedNext = inner;
            inner.prev = clamp;
            clamp.model.nestingDims = { w: 100, h: 60 };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-sole-cavity',
                    root: clamp,
                    position: { x: 0, y: 0 },
                });
            });

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('sole-inner');
            });

            expect(newTowerId).toBeTruthy();
            const sourceTower = useWorkspaceStore.getState().towers['tower-sole-cavity'];
            const containerNode = sourceTower.root as TowerStatementNode;
            expect(containerNode.nestedNext).toBeNull();
            expect(containerNode.model.nestingDims).toBeNull();
        });

        it('recalculates cavity nestingDims when extracting the first brick of a multi-brick cavity', () => {
            const clamp = makeEmptyStatement('outer-clamp-multi', 0, true);
            const first = makeEmptyStatement('first-inner', 0);
            Object.defineProperty(first.model, 'dims', {
                value: { w: 120, h: 40 },
                configurable: true,
            });
            const second = makeEmptyStatement('second-inner', 0);
            Object.defineProperty(second.model, 'dims', {
                value: { w: 140, h: 45 },
                configurable: true,
            });

            clamp.nestedNext = first;
            first.prev = clamp;
            first.next = second;
            second.prev = first;
            clamp.model.nestingDims = { w: 140, h: 85 };

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-multi-cavity',
                    root: clamp,
                    position: { x: 0, y: 0 },
                });
            });

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('first-inner');
            });

            expect(newTowerId).toBeTruthy();
            const sourceTower = useWorkspaceStore.getState().towers['tower-multi-cavity'];
            const containerNode = sourceTower.root as TowerStatementNode;
            expect(containerNode.nestedNext?.model.id).toBe('second-inner');
            expect(containerNode.model.nestingDims).toEqual({ w: 140, h: 45 });
        });

        it('extracts a nested brick containing both argument children and cavity children', () => {
            const top = makeEmptyStatement('top', 0);
            const nestedClamp = makeEmptyStatement('nested-clamp', 1, true);
            const clampArg = makeEmptyExpression('clamp-arg', 0);
            const innerChild = makeEmptyStatement('inner-child', 0);
            const bottom = makeEmptyStatement('bottom', 0);

            top.next = nestedClamp;
            nestedClamp.prev = top;
            nestedClamp.next = bottom;
            bottom.prev = nestedClamp;

            nestedClamp.args[0] = clampArg;
            clampArg.parent = nestedClamp;

            nestedClamp.nestedNext = innerChild;
            innerChild.prev = nestedClamp;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-nested-combo',
                    root: top,
                    position: { x: 0, y: 0 },
                });
            });

            expect(canExtractBrick('nested-clamp')).toBe(true);

            let newTowerId: string | null = null;
            act(() => {
                newTowerId = useWorkspaceStore.getState().extractBrickToNewTower('nested-clamp');
            });

            expect(newTowerId).toBeTruthy();
            const towers = useWorkspaceStore.getState().towers;
            const sourceTower = towers['tower-nested-combo'];
            const newTower = towers[newTowerId!];

            expect((sourceTower.root as TowerStatementNode).next?.model.id).toBe('bottom');
            expect(bottom.prev?.model.id).toBe('top');

            expect(newTower.root.model.id).toBe('nested-clamp');
            const extractedRoot = newTower.root as TowerStatementNode;
            expect(extractedRoot.args[0]?.model.id).toBe('clamp-arg');
            expect(clampArg.parent?.model.id).toBe('nested-clamp');
            expect(extractedRoot.nestedNext?.model.id).toBe('inner-child');
            expect(innerChild.prev?.model.id).toBe('nested-clamp');

            expect(extractedRoot.prev).toBeNull();
            expect(extractedRoot.next).toBeNull();

            expectGraphAcyclic(sourceTower.root);
            expectGraphAcyclic(newTower.root);
            expectPointersConsistent(sourceTower.root);
            expectPointersConsistent(newTower.root);

            const allNodeIds = [
                ...listNodes(sourceTower.root).map((n) => n.model.id),
                ...listNodes(newTower.root).map((n) => n.model.id),
            ].sort();
            expect(allNodeIds).toEqual(['bottom', 'clamp-arg', 'inner-child', 'nested-clamp', 'top']);
        });

        it('supports repeated extraction on the same tower without node loss or cycles', () => {
            const a = makeEmptyStatement('node-a', 0);
            const b = makeEmptyStatement('node-b', 0);
            const c = makeEmptyStatement('node-c', 0);
            const d = makeEmptyStatement('node-d', 0);
            const e = makeEmptyStatement('node-e', 0);

            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;
            c.next = d;
            d.prev = c;
            d.next = e;
            e.prev = d;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-multi-extract',
                    root: a,
                    position: { x: 0, y: 0 },
                });
            });

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('node-b');
            });
            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('node-d');
            });
            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('node-c');
            });

            const towers = useWorkspaceStore.getState().towers;
            expect(Object.keys(towers).length).toBe(4);

            const sourceTower = towers['tower-multi-extract'];
            expect(sourceTower.root.model.id).toBe('node-a');
            expect((sourceTower.root as TowerStatementNode).next?.model.id).toBe('node-e');
            expect(e.prev?.model.id).toBe('node-a');

            for (const tower of Object.values(towers)) {
                expectGraphAcyclic(tower.root);
                expectPointersConsistent(tower.root);
            }
        });

        it('resets positioned flags for extracted bricks in layout store', () => {
            const a = makeEmptyStatement('pos-a', 0);
            const b = makeEmptyStatement('pos-b', 0);
            a.next = b;
            b.prev = a;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-pos-test',
                    root: a,
                    position: { x: 0, y: 0 },
                });
                useBrickLayoutStore.getState().setPositioned({
                    'pos-a': true,
                    'pos-b': true,
                });
            });

            act(() => {
                useWorkspaceStore.getState().extractBrickToNewTower('pos-b');
            });

            expect(useBrickLayoutStore.getState().positioned['pos-b']).toBe(false);
            expect(useBrickLayoutStore.getState().positioned['pos-a']).toBe(true);
        });

        it('handles interleaved extraction and drag operations correctly', () => {
            const a = makeEmptyStatement('inter-a', 0);
            const b = makeEmptyStatement('inter-b', 0);
            const c = makeEmptyStatement('inter-c', 0);
            const d = makeEmptyStatement('inter-d', 0);
            const e = makeEmptyStatement('inter-e', 0);

            a.next = b;
            b.prev = a;
            b.next = c;
            c.prev = b;
            c.next = d;
            d.prev = c;
            d.next = e;
            e.prev = d;

            act(() => {
                useWorkspaceStore.getState().createTower({
                    id: 'tower-interleaved',
                    root: a,
                    position: { x: 0, y: 0 },
                });
            });

            // 1. Extract 'inter-c'
            let extractedId: string | null = null;
            act(() => {
                extractedId = useWorkspaceStore.getState().extractBrickToNewTower('inter-c');
            });
            expect(extractedId).toBeTruthy();

            // 2. Drag 'inter-d' out to a new tower
            let draggedId: string | null = null;
            act(() => {
                draggedId = useWorkspaceStore
                    .getState()
                    .detachBrickToNewTower('tower-interleaved', 'inter-d', { x: 500, y: 500 });
            });
            expect(draggedId).toBeTruthy();

            const towers = useWorkspaceStore.getState().towers;
            expect(Object.keys(towers).length).toBe(3);

            const source = towers['tower-interleaved'];
            const extracted = towers[extractedId!];
            const dragged = towers[draggedId!];

            // Source: a -> b
            expect(source.root.model.id).toBe('inter-a');
            expect((source.root as TowerStatementNode).next?.model.id).toBe('inter-b');
            expect(((source.root as TowerStatementNode).next as TowerStatementNode).next).toBeNull();

            // Extracted: c alone
            expect(extracted.root.model.id).toBe('inter-c');
            expect((extracted.root as TowerStatementNode).prev).toBeNull();
            expect((extracted.root as TowerStatementNode).next).toBeNull();

            // Dragged: d -> e
            expect(dragged.root.model.id).toBe('inter-d');
            expect((dragged.root as TowerStatementNode).prev).toBeNull();
            expect((dragged.root as TowerStatementNode).next?.model.id).toBe('inter-e');

            for (const t of [source, extracted, dragged]) {
                expectGraphAcyclic(t.root);
                expectPointersConsistent(t.root);
            }

            const allNodeIds = [
                ...listNodes(source.root).map((n) => n.model.id),
                ...listNodes(extracted.root).map((n) => n.model.id),
                ...listNodes(dragged.root).map((n) => n.model.id),
            ].sort();
            expect(allNodeIds).toEqual(['inter-a', 'inter-b', 'inter-c', 'inter-d', 'inter-e']);
        });
    });
});
