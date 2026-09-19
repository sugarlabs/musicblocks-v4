import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
import { makeEmptyStatement, makeEmptyValue } from '@/mocks/tower';
import { useBrickLayoutStore } from '@/stores/brick';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceStore } from '@/stores/workspace';
import { listNodes, traverseTopDown } from '@/utils/tower-traversal';

import { ACTION_MENU_WEDGES } from './actionMenuWedges';

// -------------------------------------------------------------------------------------------------

const trashWedge = ACTION_MENU_WEDGES.find((wedge) => wedge.id === 'trash')!;

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

afterEach(() => {
    const workspace = useWorkspaceStore.getState();
    workspace.statementCollisionSpace.reset();
    workspace.argumentCollisionSpace.reset();
    useWorkspaceStore.setState({
        towers: {},
        selectedBrickId: null,
        statementConnectors: {},
        argumentConnectors: {},
    });
    useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
    useTrashStore.setState({ bounds: null, isHovered: false, isAcknowledging: false });
    vi.restoreAllMocks();
});

// -------------------------------------------------------------------------------------------------

describe('actionMenuWedges', () => {
    describe('move to trash wedge', () => {
        it('isEnabled returns true for a live brick and false for a non-existent or removed one', () => {
            const { head } = buildStack('test', { x: 100, y: 100 });
            place('tower-1', head, { x: 100, y: 100 });

            expect(trashWedge.isEnabled('test-head')).toBe(true);
            expect(trashWedge.isEnabled('test-middle')).toBe(true);
            expect(trashWedge.isEnabled('unknown-id')).toBe(false);

            trashWedge.run('test-head');
            expect(trashWedge.isEnabled('test-head')).toBe(false);
        });

        it('discards a root brick along with its entire tower, subtree, and connectors', () => {
            const { head } = buildStack('root-test', { x: 200, y: 200 });
            const brickIds = place('tower-root', head, { x: 200, y: 200 });

            trashWedge.run('root-test-head');

            expect(useWorkspaceStore.getState().towers['tower-root']).toBeUndefined();

            const layout = useBrickLayoutStore.getState();
            for (const id of brickIds) {
                expect(layout.coords[id]).toBeUndefined();
                expect(layout.mounted[id]).toBeUndefined();
                expect(layout.positioned[id]).toBeUndefined();
            }

            const { statementConnectors, argumentConnectors } = useWorkspaceStore.getState();
            const tracked = [
                ...Object.values(statementConnectors).map((m) => m.brickId),
                ...Object.values(argumentConnectors).map((m) => m.brickId),
            ];
            expect(tracked).toHaveLength(0);
        });

        it('discards a child brick and its downstream next chain, leaving the remainder intact', () => {
            const { head } = buildStack('child-test', { x: 200, y: 200 });
            place('tower-child', head, { x: 200, y: 200 });

            trashWedge.run('child-test-middle');

            const remainingTower = useWorkspaceStore.getState().towers['tower-child'];
            expect(remainingTower).toBeDefined();
            expect(remainingTower.root.model.id).toBe(head.model.id);
            expect(head.next).toBeNull();

            const layout = useBrickLayoutStore.getState();
            expect(layout.coords['child-test-head']).toBeDefined();
            expect(layout.coords['child-test-middle']).toBeUndefined();
            expect(layout.coords['child-test-tail']).toBeUndefined();
            expect(layout.coords['child-test-arg']).toBeUndefined();
        });

        it('discards an argument brick attached to a statement', () => {
            const { head, middle } = buildStack('arg-test', { x: 300, y: 300 });
            place('tower-arg', head, { x: 300, y: 300 });

            trashWedge.run('arg-test-arg');

            expect(middle.args[0]).toBeNull();

            const layout = useBrickLayoutStore.getState();
            expect(layout.coords['arg-test-head']).toBeDefined();
            expect(layout.coords['arg-test-middle']).toBeDefined();
            expect(layout.coords['arg-test-arg']).toBeUndefined();
        });

        it('discards a folded cavity sub-tree, purging hidden bricks from layout store', () => {
            const clamp = makeEmptyStatement('clamp', 0, true);
            const inside1 = makeEmptyStatement('inside-1', 0);
            const inside2 = makeEmptyStatement('inside-2', 0);

            clamp.nestedNext = inside1;
            inside1.prev = clamp;
            inside1.next = inside2;
            inside2.prev = inside1;

            clamp.model.isNestingFolded = true;

            traverseTopDown(clamp, { x: 100, y: 100 });
            place('tower-clamp', clamp, { x: 100, y: 100 });

            trashWedge.run('clamp');

            expect(useWorkspaceStore.getState().towers['tower-clamp']).toBeUndefined();

            const layout = useBrickLayoutStore.getState();
            expect(layout.coords['clamp']).toBeUndefined();
            expect(layout.coords['inside-1']).toBeUndefined();
            expect(layout.coords['inside-2']).toBeUndefined();
        });

        it('clears selection and triggers acknowledgeTrash on deletion', () => {
            const { head } = buildStack('sel-test', { x: 100, y: 100 });
            place('tower-sel', head, { x: 100, y: 100 });

            useWorkspaceStore.setState({ selectedBrickId: 'sel-test-head' });

            trashWedge.run('sel-test-head');

            expect(useWorkspaceStore.getState().selectedBrickId).toBeNull();
            expect(useTrashStore.getState().isAcknowledging).toBe(true);
        });

        it('does nothing when run on a non-existent brick id', () => {
            const { head } = buildStack('noop-test', { x: 100, y: 100 });
            place('tower-noop', head, { x: 100, y: 100 });

            trashWedge.run('does-not-exist');

            expect(useWorkspaceStore.getState().towers['tower-noop']).toBeDefined();
            expect(useTrashStore.getState().isAcknowledging).toBe(false);
        });
    });
});
