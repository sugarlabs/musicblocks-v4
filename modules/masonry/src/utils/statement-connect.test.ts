import { describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';
import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { StatementConnectorMeta, TowerState } from '@/@types/workspace.types';
import { StatementBrickModel, ValueBrickModel } from '@/models/brick';

import { extractStatementConnectors } from './statement-collision';
import {
    collectStatementProbes,
    joinTowers,
    resolveStatementDrop,
    type StatementJoinPlan,
} from './statement-connect';
import { QuadtreeCollisionSpace } from './collision';

const colorsDefault = { background: '#3498db', foreground: '#ffffff', border: '#2980b9' };

function makeStatement(
    id: string,
    opts: { hasNesting?: boolean; prev?: boolean; next?: boolean } = {},
): TowerStatementNode {
    const node: TowerStatementNode = {
        kind: 'statement',
        model: new StatementBrickModel({
            id,
            colorsDefault,
            tooltipText: '',
            widget: { type: 'label', text: id },
            params: [],
            hasConnectionPrev: opts.prev ?? true,
            hasConnectionNext: opts.next ?? true,
            hasNesting: opts.hasNesting ?? false,
        }),
        prev: null,
        next: null,
        args: [],
        nestedNext: opts.hasNesting ? null : undefined,
    };
    // Compute real dims/bounds so prev (top) and next (bottom) connectors are vertically separated
    // rather than collapsing onto the same point at height 0.
    node.model.computeOutline();
    return node;
}

/** Links a -> b via next/prev and returns a. */
function link(a: TowerStatementNode, b: TowerStatementNode): TowerStatementNode {
    a.next = b;
    b.prev = a;
    return a;
}

/** Populates a fresh statement collision space + connectors record from a positioned tower. */
function seed(towerId: string, root: TowerNode) {
    const space = new QuadtreeCollisionSpace(4000, 4000);
    const connectors: Record<number, StatementConnectorMeta> = {};
    const results = extractStatementConnectors(towerId, root);
    space.createObjects(results.map((r) => r.object));
    for (const r of results) connectors[r.meta.id] = r.meta;
    return { space, connectors, results };
}

/** The world point of the given connector type on a specific brick, from the seeded results. */
function pointOf(
    results: ReturnType<typeof seed>['results'],
    brickId: string,
    type: StatementConnectorMeta['type'],
): Point {
    const { object } = results.find((r) => r.meta.brickId === brickId && r.meta.type === type)!;
    return { x: object.x, y: object.y };
}

describe('collectStatementProbes', () => {
    it('emits the root prev and tail next for an open single statement', () => {
        const s = makeStatement('s');
        s.model.setPosition(200, 300);
        const coords = { s: { x: 200, y: 300 } };

        const probes = collectStatementProbes(s, coords);
        const kinds = probes.map((p) => p.kind).sort();

        expect(kinds).toEqual(['next', 'prev']);
    });

    it('probes the tail (not the root) for the next end of a chain', () => {
        const head = makeStatement('head');
        const tail = makeStatement('tail');
        link(head, tail);
        const coords = { head: { x: 0, y: 0 }, tail: { x: 0, y: 40 } };

        const probes = collectStatementProbes(head, coords);

        // prev comes from the head, next from the tail.
        expect(probes.find((p) => p.kind === 'prev')).toBeTruthy();
        const next = probes.find((p) => p.kind === 'next')!;
        expect(next.point.y).toBeGreaterThan(40); // tail.y + tail height
    });

    it('omits an end that is already connected', () => {
        const head = makeStatement('head');
        const tail = makeStatement('tail');
        link(head, tail); // head.next occupied, tail.prev occupied
        const coords = { head: { x: 0, y: 0 }, tail: { x: 0, y: 40 } };

        // Head's prev is open; head's next is occupied. Tail's next is open.
        const headProbes = collectStatementProbes(head, coords);
        expect(headProbes.map((p) => p.kind).sort()).toEqual(['next', 'prev']); // next from tail
    });

    it('returns nothing for a non-statement root', () => {
        const value: TowerNode = {
            kind: 'value',
            model: new ValueBrickModel({
                id: 'v',
                colorsDefault,
                tooltipText: '',
                widget: { type: 'numberbox', value: 1 },
            }),
            parent: null,
        };
        expect(collectStatementProbes(value, { v: { x: 0, y: 0 } })).toEqual([]);
    });
});

describe('resolveStatementDrop', () => {
    it('matches a dragged prev onto a target next (stack below)', () => {
        const target = makeStatement('T');
        target.model.setPosition(500, 500);
        const { space, connectors, results } = seed('target', target);
        const dragged = makeStatement('D');

        const plan = resolveStatementDrop({
            draggedRoot: dragged,
            probes: [{ kind: 'prev', point: pointOf(results, 'T', 'next') }],
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(plan).not.toBeNull();
        expect(plan!.draggedKind).toBe('prev');
        expect(plan!.targetKind).toBe('next');
        expect(plan!.target).toBe(target);
        expect(plan!.targetTowerId).toBe('target');
    });

    it('matches a dragged next onto a target prev (attach above)', () => {
        const target = makeStatement('T');
        target.model.setPosition(500, 500);
        const { space, connectors, results } = seed('target', target);
        const dragged = makeStatement('D');

        const plan = resolveStatementDrop({
            draggedRoot: dragged,
            probes: [{ kind: 'next', point: pointOf(results, 'T', 'prev') }],
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(plan!.draggedKind).toBe('next');
        expect(plan!.targetKind).toBe('prev');
    });

    it('rejects an invalid pairing (next onto next)', () => {
        const target = makeStatement('T');
        // Make the brick tall so its prev (top) is far from its next (bottom) — the probe placed at
        // the next connector then can't also fall within snap range of the prev, keeping this a
        // clean test of the next↔next rejection independent of SNAP_DISTANCE.
        target.model.widgetDims = { w: 100, h: 240 };
        target.model.computeOutline();
        target.model.setPosition(500, 500);
        const { space, connectors, results } = seed('target', target);

        const plan = resolveStatementDrop({
            draggedRoot: makeStatement('D'),
            probes: [{ kind: 'next', point: pointOf(results, 'T', 'next') }],
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(plan).toBeNull();
    });

    it("never snaps onto the dragged tower's own connectors", () => {
        const target = makeStatement('T');
        target.model.setPosition(500, 500);
        const { space, connectors, results } = seed('self', target);

        const plan = resolveStatementDrop({
            draggedRoot: makeStatement('D'),
            probes: [{ kind: 'prev', point: pointOf(results, 'T', 'next') }],
            draggedTowerId: 'self',
            space,
            connectors,
            towers: { self: { id: 'self', root: target, position: { x: 0, y: 0 } } },
        });

        expect(plan).toBeNull();
    });

    it('returns null when nothing is within snap distance', () => {
        const target = makeStatement('T');
        target.model.setPosition(500, 500);
        const { space, connectors } = seed('target', target);

        const plan = resolveStatementDrop({
            draggedRoot: makeStatement('D'),
            probes: [{ kind: 'prev', point: { x: 20, y: 20 } }],
            draggedTowerId: 'dragged',
            space,
            connectors,
            towers: { target: { id: 'target', root: target, position: { x: 0, y: 0 } } },
        });

        expect(plan).toBeNull();
    });
});

describe('joinTowers', () => {
    it('S1: stacks the dragged root below the target next', () => {
        const target = makeStatement('T');
        const dragged = makeStatement('D');
        const plan: StatementJoinPlan = {
            targetTowerId: 't',
            draggedRoot: dragged,
            target,
            draggedKind: 'prev',
            targetKind: 'next',
        };

        joinTowers(plan);

        expect(target.next).toBe(dragged);
        expect(dragged.prev).toBe(target);
        expect(target.model.hasConnectionNext).toBe(true);
        expect(dragged.model.hasConnectionPrev).toBe(true);
    });

    it('S1 mid-chain: reconnects the displaced successor onto the dragged tail', () => {
        const target = makeStatement('T');
        const displaced = makeStatement('X');
        link(target, displaced); // target.next = X
        const dragged = makeStatement('D');

        joinTowers({
            targetTowerId: 't',
            draggedRoot: dragged,
            target,
            draggedKind: 'prev',
            targetKind: 'next',
        });

        // Order becomes T -> D -> X
        expect(target.next).toBe(dragged);
        expect(dragged.next).toBe(displaced);
        expect(displaced.prev).toBe(dragged);
    });

    it('S2: nests the dragged root at the head of the target cavity', () => {
        const target = makeStatement('T', { hasNesting: true });
        const dragged = makeStatement('D');

        joinTowers({
            targetTowerId: 't',
            draggedRoot: dragged,
            target,
            draggedKind: 'prev',
            targetKind: 'nestedNext',
        });

        expect(target.nestedNext).toBe(dragged);
        expect(dragged.prev).toBe(target);
        expect(dragged.model.hasConnectionPrev).toBe(true);
    });

    it('S3: attaches the dragged tail above the target prev', () => {
        const target = makeStatement('T');
        const dragged = makeStatement('D');

        joinTowers({
            targetTowerId: 't',
            draggedRoot: dragged,
            target,
            draggedKind: 'next',
            targetKind: 'prev',
        });

        expect(dragged.next).toBe(target);
        expect(target.prev).toBe(dragged);
    });

    it('S3 mid-chain: inserts the dragged tower between a predecessor and the target', () => {
        const predecessor = makeStatement('P');
        const target = makeStatement('T');
        link(predecessor, target); // P.next = T
        const dragged = makeStatement('D');

        joinTowers({
            targetTowerId: 't',
            draggedRoot: dragged,
            target,
            draggedKind: 'next',
            targetKind: 'prev',
        });

        // Order becomes P -> D -> T
        expect(predecessor.next).toBe(dragged);
        expect(dragged.prev).toBe(predecessor);
        expect(dragged.next).toBe(target);
        expect(target.prev).toBe(dragged);
    });
});
