import { act } from '@testing-library/react';

import { useWorkspaceStore } from './workspace';
import { useBrickLayoutStore } from './brick';
import {
    expressionTree,
    makeEmptyExpression,
    makeEmptyStatement,
    makeEmptyValue,
    statementTreeNoNesting,
    statementTreeWithNesting,
} from '@/mocks/tower';
import { exportWorkspace } from '@/utils/import-export';
import { listNodes } from '@/utils/tower-traversal';
import type { Bounds, Point } from '@/@types/common.types';
import type { TowerExpressionNode, TowerStatementNode } from '@/@types/tower.types';
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
                statementConnectors: {},
                argumentConnectors: {},
            });
        });
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
});
