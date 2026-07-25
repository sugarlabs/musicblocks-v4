import { act } from '@testing-library/react';

import type { TowerExpressionNode, TowerValueNode } from '@/@types/tower.types';
import { ExpressionBrickModel, ValueBrickModel } from '@/models/brick';

import { useWorkspaceStore } from './workspace';
import { expressionTree, statementTreeNoNesting } from '@/mocks/tower';
import { joinArg } from '@/utils/argument-connect';
import { listNodes } from '@/utils/tower-traversal';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

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

    it('absorbs the dragged tower and bumps the host layoutVersion on an argument join', () => {
        const host: TowerExpressionNode = {
            kind: 'expression',
            model: new ExpressionBrickModel({
                id: 'host',
                colorsDefault,
                tooltipText: '',
                widget: { type: 'label', text: '+' },
                params: ['A'],
            }),
            parent: null,
            args: [null],
        };
        host.model.setPosition(400, 300);

        const dragged: TowerValueNode = {
            kind: 'value',
            model: new ValueBrickModel({
                id: 'dragged',
                colorsDefault,
                tooltipText: '',
                widget: { type: 'numberbox', value: 7 },
            }),
            parent: null,
        };
        dragged.model.setPosition(900, 300);

        act(() => {
            const store = useWorkspaceStore.getState();
            store.createTower({ id: 'host-tower', root: host, position: { x: 0, y: 0 } });
            store.createTower({ id: 'dragged-tower', root: dragged, position: { x: 0, y: 0 } });
            store.syncArgumentConnectors('host-tower', host);
            store.syncArgumentConnectors('dragged-tower', dragged);
        });

        // Splice the graph (as the drop handler does), then let the store finish the merge.
        act(() => {
            joinArg({ draggedRoot: dragged, target: host, slotIndex: 0 });
            useWorkspaceStore.getState().absorbTower('dragged-tower', 'host-tower');
        });

        const state = useWorkspaceStore.getState();

        // The dragged tower is gone; the host remains with a bumped layoutVersion.
        expect(state.towers['dragged-tower']).toBeUndefined();
        expect(state.towers['host-tower']).toBeDefined();
        expect(state.towers['host-tower'].layoutVersion).toBe(1);

        // The dragged tower's own connector book-keeping was purged.
        expect(
            Object.values(state.argumentConnectors).some((m) => m.towerId === 'dragged-tower'),
        ).toBe(false);

        // The node graph reflects the join.
        expect(host.args[0]).toBe(dragged);
        expect(dragged.parent).toBe(host);
    });
});
