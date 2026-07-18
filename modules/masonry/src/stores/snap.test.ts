import { beforeEach, describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import { StatementBrickModel, ValueBrickModel } from '@/models/brick';
import { collectArgConnectors, collectConnectors, type OpenConnector } from '@/utils/connectors';

import { useBrickLayoutStore } from './brick';
import { getSnapEngine, refreshSnapTargets } from './snap';
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

/** A dragged probe connector; a different tower id than the target so the cycle guard passes. */
function probe(kind: OpenConnector['kind'], point: Point): OpenConnector {
    return { towerId: 'dragged', nodeId: 'P', kind, point };
}

describe('stores/snap', () => {
    beforeEach(() => {
        useWorkspaceStore.setState({ towers: {} });
        useBrickLayoutStore.setState({ coords: {}, mounted: {}, positioned: {} });
    });

    describe('getSnapEngine', () => {
        it('returns the same instance for the same canvas size and a new one on resize', () => {
            const a = getSnapEngine(800, 600);
            const b = getSnapEngine(800, 600);
            expect(b).toBe(a);

            const c = getSnapEngine(1000, 600);
            expect(c).not.toBe(a);
        });
    });

    describe('refreshSnapTargets', () => {
        it('builds targets from every tower except the dragged one', () => {
            const towerA = makeStatement('A');
            const towerB = makeStatement('B');

            const posA: Point = { x: 100, y: 100 };
            const posB: Point = { x: 500, y: 100 };

            useWorkspaceStore.setState({
                towers: {
                    'tower-a': { id: 'tower-a', root: towerA, position: posA },
                    'tower-b': { id: 'tower-b', root: towerB, position: posB },
                },
            });
            // Layout coords are ABSOLUTE (origin baked in), so seed each brick at its tower's
            // position — the connector origin is (0, 0), matching `refreshSnapTargets`.
            useBrickLayoutStore.getState().setCoords({ A: posA, B: posB });

            const coords = useBrickLayoutStore.getState().coords;
            const origin: Point = { x: 0, y: 0 };
            const bNext = collectConnectors(towerB, origin, coords, 'tower-b').find(
                (c) => c.kind === 'next',
            )!;
            const aNext = collectConnectors(towerA, origin, coords, 'tower-a').find(
                (c) => c.kind === 'next',
            )!;

            const engine = getSnapEngine(1000, 1000);
            // Drag tower A → its connectors must be excluded, tower B's must be present.
            refreshSnapTargets('tower-a');

            // A dragged prev groove over tower B's next tab snaps.
            const hitB = engine.findSnap(probe('prev', bNext.point));
            expect(hitB).not.toBeNull();
            expect(hitB!.targetTowerId).toBe('tower-b');
            expect(hitB!.targetNodeId).toBe('B');
            expect(hitB!.targetKind).toBe('next');

            // The same probe over tower A's (excluded) next tab finds nothing.
            expect(engine.findSnap(probe('prev', aNext.point))).toBeNull();
        });

        it('includes occupied connectors as targets (insertion reachable)', () => {
            const head = makeStatement('head');
            const tail = makeStatement('tail');
            head.next = tail;
            tail.prev = head;

            const pos: Point = { x: 200, y: 200 };
            useWorkspaceStore.setState({
                towers: { chain: { id: 'chain', root: head, position: pos } },
            });
            // Absolute coords: head at the tower origin, tail flush below it.
            useBrickLayoutStore
                .getState()
                .setCoords({ head: { x: 200, y: 200 }, tail: { x: 200, y: 320 } });

            const coords = useBrickLayoutStore.getState().coords;
            const origin: Point = { x: 0, y: 0 };
            const headNext = collectConnectors(head, origin, coords, 'chain').find(
                (c) => c.nodeId === 'head' && c.kind === 'next',
            )!;
            expect(headNext.occupied).toBe(true);

            const engine = getSnapEngine(1000, 1000);
            refreshSnapTargets('other');

            const hit = engine.findSnap(probe('prev', headNext.point));
            expect(hit).not.toBeNull();
            expect(hit!.targetNodeId).toBe('head');
            expect(hit!.target.occupied).toBe(true);
        });

        it('adds argument connectors to the target set without disturbing statement snapping', () => {
            // A statement carrying one value arg, so the tower exposes argument-domain connectors
            // (the slot input + the value's output) alongside its statement-sequence connectors.
            const child: TowerValueNode = {
                kind: 'value',
                model: new ValueBrickModel({
                    id: 'C',
                    colorsDefault,
                    tooltipText: '',
                    widget: { type: 'numberbox', value: 0 },
                }),
                parent: null,
            };
            const host: TowerStatementNode = {
                kind: 'statement',
                model: new StatementBrickModel({
                    id: 'H',
                    colorsDefault,
                    tooltipText: '',
                    widget: { type: 'label', text: 'H' },
                    params: ['A'],
                    hasConnectionPrev: true,
                    hasConnectionNext: true,
                    hasNesting: false,
                }),
                prev: null,
                next: null,
                args: [child],
                nestedNext: undefined,
            };
            child.parent = host;

            const pos: Point = { x: 300, y: 300 };
            useWorkspaceStore.setState({
                towers: { host: { id: 'host', root: host, position: pos } },
            });
            useBrickLayoutStore.getState().setCoords({ H: pos, C: { x: 420, y: 300 } });

            const coords = useBrickLayoutStore.getState().coords;
            const origin: Point = { x: 0, y: 0 };
            const args = collectArgConnectors(host, origin, coords, 'host');
            // Sanity: the tower really does expose argument connectors that must reach the space.
            expect(args.some((c) => c.kind === 'output')).toBe(true);
            expect(args.some((c) => c.kind === 'input')).toBe(true);

            const hostNext = collectConnectors(host, origin, coords, 'host').find(
                (c) => c.kind === 'next',
            )!;
            const valueOutput = args.find((c) => c.kind === 'output')!;

            const engine = getSnapEngine(1000, 1000);
            refreshSnapTargets('dragged');

            // Statement snapping still resolves against the arg-bearing tower.
            const hit = engine.findSnap(probe('prev', hostNext.point));
            expect(hit).not.toBeNull();
            expect(hit!.targetNodeId).toBe('H');
            expect(hit!.targetKind).toBe('next');

            // Argument connectors are in the space but never cross-match a statement probe
            // (isValidMate rejects the argument domain until join lands), so no false snap.
            expect(engine.findSnap(probe('prev', valueOutput.point))).toBeNull();
        });
    });
});
