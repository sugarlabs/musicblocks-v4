import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerStatementNode } from '@/@types/tower.types';
import { statementTreeNoNesting } from '@/mocks/tower';
import { StatementBrickModel } from '@/models/brick';
import { joinTowers } from '@/utils/tower-join';
import { listNodes } from '@/utils/tower-traversal';

import { useWorkspaceStore } from './workspace';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

/** A standalone statement node whose prev/next are both open (null). */
function makeStatement(id: string): TowerStatementNode {
    return {
        kind: 'statement',
        model: new StatementBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params: [],
            hasConnectionPrev: true,
            hasConnectionNext: true,
            hasNesting: false,
        }),
        prev: null,
        next: null,
        args: [],
        nestedNext: undefined,
    };
}

/** Links a run of statement nodes head→tail via prev/next; returns the head. */
function chain(...nodes: TowerStatementNode[]): TowerStatementNode {
    nodes.forEach((node, i) => {
        node.prev = nodes[i - 1] ?? null;
        node.next = nodes[i + 1] ?? null;
    });
    return nodes[0];
}

const position: Point = { x: 0, y: 0 };

describe('stores/workspace absorbTower', () => {
    beforeEach(() => {
        useWorkspaceStore.setState({ towers: {} });
    });

    it('drops the dragged tower and bumps the target layoutVersion', () => {
        const target = makeStatement('T');
        const draggedRoot = makeStatement('D');

        const { createTower, absorbTower } = useWorkspaceStore.getState();
        createTower({ id: 'target', root: target, position });
        createTower({ id: 'dragged', root: draggedRoot, position });

        // S1 stack-below: dragged root prev ← target next. Head stays the target root.
        joinTowers({ draggedRoot, target, draggedKind: 'prev', targetKind: 'next' });
        absorbTower('dragged', 'target');

        const { towers } = useWorkspaceStore.getState();
        expect(towers.dragged).toBeUndefined();
        expect(towers.target.layoutVersion).toBe(1);
        expect(towers.target.root).toBe(target);
        // Both nodes are reachable from the surviving root by forward pointers.
        const ids = listNodes(towers.target.root).map((n) => n.model.id);
        expect(ids).toEqual(expect.arrayContaining(['T', 'D']));
    });

    it('re-roots at the new head for S3 attach-above onto the target root (reachability)', () => {
        // Target tower is a single free node R; dragged tower is D1 → D2.
        const target = makeStatement('R');
        const draggedRoot = chain(makeStatement('D1'), makeStatement('D2'));

        const { createTower, absorbTower } = useWorkspaceStore.getState();
        createTower({ id: 'target', root: target, position });
        createTower({ id: 'dragged', root: draggedRoot, position });

        // S3: dragged tail (D2) next → target (R) prev. This prepends D1 → D2 ABOVE R, so the
        // dragged root D1 becomes the new head of the merged graph.
        joinTowers({ draggedRoot, target, draggedKind: 'next', targetKind: 'prev' });
        absorbTower('dragged', 'target');

        const { towers } = useWorkspaceStore.getState();
        expect(towers.dragged).toBeUndefined();

        // The surviving tower must be re-rooted at the new head D1 (not the old, now non-head R),
        // otherwise the prepended dragged bricks are unreachable and never repositioned/rendered.
        expect(towers.target.root).toBe(draggedRoot);

        const ids = listNodes(towers.target.root).map((n) => n.model.id);
        expect(ids).toEqual(expect.arrayContaining(['D1', 'D2', 'R']));
        expect(ids).toHaveLength(3);
    });

    it('keeps the stored root for S3 insert-above mid-chain (head unchanged)', () => {
        // Target tower head P → R; dragged tower D snaps onto R's occupied prev (insert above R).
        const oldPrev = makeStatement('P');
        const target = chain(oldPrev, makeStatement('R')).next as TowerStatementNode;
        const draggedRoot = makeStatement('D');

        const { createTower, absorbTower } = useWorkspaceStore.getState();
        createTower({ id: 'target', root: oldPrev, position });
        createTower({ id: 'dragged', root: draggedRoot, position });

        joinTowers({ draggedRoot, target, draggedKind: 'next', targetKind: 'prev' });
        absorbTower('dragged', 'target');

        const { towers } = useWorkspaceStore.getState();
        // The tower head P was never displaced, so the root stays P.
        expect(towers.target.root).toBe(oldPrev);
        const ids = listNodes(towers.target.root).map((n) => n.model.id);
        expect(ids).toEqual(expect.arrayContaining(['P', 'D', 'R']));
        expect(ids).toHaveLength(3);
    });
});

describe('Workspace Store Collision Space', () => {
    beforeEach(() => {
        // Reset the store state before each test
        const store = useWorkspaceStore.getState();
        store.statementCollisionSpace.reset();
        act(() => {
            useWorkspaceStore.setState({
                towers: {},
                statementConnectors: {},
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
});
