import { act } from '@testing-library/react';

import { useWorkspaceStore } from './workspace';
import { useBrickLayoutStore } from './brick';
import {
    expressionTree,
    makeEmptyExpression,
    makeEmptyValue,
    statementTreeNoNesting,
    statementTreeWithNesting,
} from '@/mocks/tower';
import { exportWorkspace } from '@/utils/import-export';
import { listNodes } from '@/utils/tower-traversal';
import type { TowerExpressionNode, TowerStatementNode } from '@/@types/tower.types';

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
});
