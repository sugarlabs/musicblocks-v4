import { describe, expect, it } from 'vitest';

import type { Point } from '@/@types/common.types';

import type { Connector, ConnectorKind } from './connectors';
import { SNAP_DISTANCE, SnapEngine } from './snap';

// Canvas large enough that every connector sits well inside the collision space's valid margin
// (createObjects drops anything within SNAP_DIAMETER/2 of an edge).
const CANVAS: Point = { x: 1000, y: 1000 };

/**
 * Builds a statement-domain connector at an absolute canvas point. Defaults to open (`occupied`
 * false); pass `occupied` to model a connector that already links a neighbour (an insertion
 * target). A `Connector` is also a valid dragged probe, since it extends `OpenConnector`.
 */
function connector(
    towerId: string,
    nodeId: string,
    kind: ConnectorKind,
    point: Point,
    occupied = false,
): Connector {
    return { towerId, nodeId, kind, point, occupied };
}

function makeEngine(targets: Connector[]): SnapEngine {
    const engine = new SnapEngine(CANVAS.x, CANVAS.y);
    engine.setTargets(targets);
    return engine;
}

describe('SnapEngine.findSnap', () => {
    describe('accepts the approved matings', () => {
        it('S1: dragged prev groove snaps to a target next tab (stack below)', () => {
            const target = connector('target', 'T', 'next', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 305, y: 300 }); // distance 5

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetTowerId).toBe('target');
            expect(result!.targetNodeId).toBe('T');
            expect(result!.targetKind).toBe('next');
            expect(result!.draggedKind).toBe('prev');
            expect(result!.distance).toBeCloseTo(5);
        });

        it('S2: dragged prev groove snaps to a target nestedNext tab (nest in clamp)', () => {
            const target = connector('target', 'T', 'nestedNext', { x: 400, y: 400 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 400, y: 410 }); // distance 10

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetKind).toBe('nestedNext');
            expect(result!.draggedKind).toBe('prev');
        });

        it('S3: dragged next tab snaps to a target prev groove (attach above)', () => {
            const target = connector('target', 'T', 'prev', { x: 500, y: 500 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'next', { x: 500, y: 505 }); // distance 5

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetKind).toBe('prev');
            expect(result!.draggedKind).toBe('next');
        });
    });

    it('reports the full matched target connector (for mid-chain insertion detection)', () => {
        const target = connector('target', 'clamp', 'nestedNext', { x: 300, y: 300 });
        const engine = makeEngine([target]);

        const dragged = connector('dragged', 'D', 'prev', { x: 303, y: 300 });

        const result = engine.findSnap(dragged);
        expect(result).not.toBeNull();
        expect(result!.target).toEqual(target);
        expect(result!.dragged).toEqual(dragged);
    });

    describe('accepts occupied targets (mid-chain insertion)', () => {
        it('matches an occupied next tab and flags it for insertion below', () => {
            // A node already followed by a successor: dragged prev groove snaps in between.
            const target = connector('target', 'T', 'next', { x: 300, y: 300 }, true);
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 302, y: 300 });

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetKind).toBe('next');
            expect(result!.target.occupied).toBe(true);
        });

        it('matches an occupied prev groove and flags it for insertion above', () => {
            const target = connector('target', 'T', 'prev', { x: 400, y: 400 }, true);
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'next', { x: 400, y: 403 });

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetKind).toBe('prev');
            expect(result!.target.occupied).toBe(true);
        });

        it('matches an occupied nestedNext tab (insert at cavity head)', () => {
            const target = connector('target', 'clamp', 'nestedNext', { x: 500, y: 500 }, true);
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 500, y: 504 });

            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.targetKind).toBe('nestedNext');
            expect(result!.target.occupied).toBe(true);
        });
    });

    describe('rejects incompatible tab/groove pairings', () => {
        it('tab ↔ tab: dragged next tab does not mate a target next tab', () => {
            const target = connector('target', 'T', 'next', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'next', { x: 300, y: 300 }); // same point
            expect(engine.findSnap(dragged)).toBeNull();
        });

        it('groove ↔ groove: dragged prev groove does not mate a target prev groove', () => {
            const target = connector('target', 'T', 'prev', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 300, y: 300 });
            expect(engine.findSnap(dragged)).toBeNull();
        });

        it('dragged nestedNext is never a valid probe, even onto a compatible groove', () => {
            // nestedNext is a tab and prev a groove, so geometry would allow it — but a moving tower
            // only ever probes by its outer prev/next ends, so a dragged nestedNext is rejected.
            const target = connector('target', 'T', 'prev', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'nestedNext', { x: 300, y: 300 });
            expect(engine.findSnap(dragged)).toBeNull();
        });
    });

    it('rejects a connector on the same tower (cycle guard)', () => {
        // Compatible kinds and coincident points, but same towerId — must not mate.
        const target = connector('same', 'T', 'next', { x: 300, y: 300 });
        const engine = makeEngine([target]);

        const dragged = connector('same', 'D', 'prev', { x: 300, y: 300 });
        expect(engine.findSnap(dragged)).toBeNull();
    });

    describe('snap-distance boundary (fires strictly inside SNAP_DISTANCE)', () => {
        // Collision fires when centre distance is STRICTLY less than SNAP_DISTANCE, so the boundary
        // itself is a miss. These pin the exact edge so a change to SNAP_DISTANCE/threshold is caught.
        it('snaps a valid mate just inside SNAP_DISTANCE', () => {
            const target = connector('target', 'T', 'next', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', {
                x: 300 + SNAP_DISTANCE - 1,
                y: 300,
            });
            const result = engine.findSnap(dragged);
            expect(result).not.toBeNull();
            expect(result!.distance).toBeCloseTo(SNAP_DISTANCE - 1);
        });

        it('does not snap a valid mate sitting exactly at SNAP_DISTANCE', () => {
            const target = connector('target', 'T', 'next', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', { x: 300 + SNAP_DISTANCE, y: 300 });
            expect(engine.findSnap(dragged)).toBeNull();
        });

        it('does not snap a valid mate just beyond SNAP_DISTANCE', () => {
            const target = connector('target', 'T', 'next', { x: 300, y: 300 });
            const engine = makeEngine([target]);

            const dragged = connector('dragged', 'D', 'prev', {
                x: 300 + SNAP_DISTANCE + 1,
                y: 300,
            });
            expect(engine.findSnap(dragged)).toBeNull();
        });
    });

    it('returns the nearest valid candidate when several are in range', () => {
        const near = connector('target', 'near', 'next', { x: 300, y: 300 });
        const far = connector('target', 'far', 'next', { x: 300, y: 312 });
        // Register the far one first, so the result depends on distance, not insertion order.
        const engine = makeEngine([far, near]);

        const dragged = connector('dragged', 'D', 'prev', { x: 300, y: 302 }); // 2px from near, 10px from far

        const result = engine.findSnap(dragged);
        expect(result).not.toBeNull();
        expect(result!.targetNodeId).toBe('near');
        expect(result!.distance).toBeCloseTo(2);
    });

    it('breaks an exact distance tie in favour of the earliest-registered target', () => {
        // Two compatible targets equidistant from the probe: the one registered first must win, so
        // the outcome is deterministic rather than dependent on the collision space's scan order.
        const first = connector('target', 'first', 'next', { x: 300 - 10, y: 300 });
        const second = connector('target', 'second', 'next', { x: 300 + 10, y: 300 });
        const engine = makeEngine([first, second]);

        const dragged = connector('dragged', 'D', 'prev', { x: 300, y: 300 }); // 10px from each

        const result = engine.findSnap(dragged);
        expect(result).not.toBeNull();
        expect(result!.distance).toBeCloseTo(10);
        expect(result!.targetNodeId).toBe('first');
    });

    it('skips an incompatible nearer candidate in favour of a compatible farther one', () => {
        const nearIncompatible = connector('target', 'near', 'prev', { x: 300, y: 301 }); // groove ↔ groove
        const farCompatible = connector('target', 'far', 'next', { x: 300, y: 308 });
        const engine = makeEngine([nearIncompatible, farCompatible]);

        const dragged = connector('dragged', 'D', 'prev', { x: 300, y: 300 });

        const result = engine.findSnap(dragged);
        expect(result).not.toBeNull();
        expect(result!.targetNodeId).toBe('far');
    });

    it('returns null when there are no targets', () => {
        const engine = makeEngine([]);
        const dragged = connector('dragged', 'D', 'prev', { x: 300, y: 300 });
        expect(engine.findSnap(dragged)).toBeNull();
    });
});
