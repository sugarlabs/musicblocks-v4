import type { Bounds } from '@/@types/common.types';

import { BruteForceCollisionSpace, type CollisionObject, type CollisionSpace } from './collision';
import type { Connector, ConnectorKind, OpenConnector } from './connectors';

/**
 * Tolerance margin, in canvas px, added around each connector's footprint on every side — the
 * snap's "forgiveness", kept separate from connector geometry. Tunable: higher = more forgiving.
 */
export const SNAP_DISTANCE = 20;

/**
 * Overlap threshold for the circle-shaped collision space (radius `min(w, h) / 2`). At 0.5, with
 * every box inflated by `SNAP_DISTANCE` per side, a zero-footprint connector fires at exactly
 * `SNAP_DISTANCE`; a larger footprint fires proportionally sooner.
 */
const SNAP_THRESHOLD = 0.5;

/**
 * A connector's collision box: its footprint centred on the connector, inflated by `SNAP_DISTANCE`
 * on every side. Footprints vary per connector, so the box is no longer a fixed square.
 */
function probeBox(id: number, bounds: Bounds): CollisionObject {
    return {
        id,
        x: bounds.x,
        y: bounds.y,
        w: bounds.w + 2 * SNAP_DISTANCE,
        h: bounds.h + 2 * SNAP_DISTANCE,
    };
}

// Sentinel id for the transient dragged probe. Target ids are non-negative, so the probe can
// never be mistaken for (or self-collide with) a tracked target.
const PROBE_ID = -1;

/**
 * A valid snap between a dragged connector and a target connector on another tower. The full
 * `target` connector (not just its id) is reported so the join step can read `target.occupied` to
 * detect mid-chain insertion.
 */
export interface SnapCandidate {
    /** Tower that owns the matched target connector. */
    targetTowerId: string;
    /** Node (brick) that owns the matched target connector. */
    targetNodeId: string;
    /** Which connector on the target was matched. */
    targetKind: ConnectorKind;
    /** Node (brick) on the dragged tower whose connector was probed. */
    draggedNodeId: string;
    /** Which connector on the dragged tower was probed. */
    draggedKind: ConnectorKind;
    /** Centre-to-centre distance between the two connectors, in canvas px. */
    distance: number;
    /** The full matched target connector; its `occupied` flag drives plain join vs. mid-chain insertion. */
    target: Connector;
    /** The full dragged connector that was probed. */
    dragged: OpenConnector;
}

/**
 * Whether a dragged connector may mate with a target, per the approved spec — tabs plug into
 * grooves, never tab↔tab or groove↔groove (`prev` is a groove; `next`/`nestedNext` are tabs):
 *   - S1 stack below:   dragged `prev` ← target `next`
 *   - S2 nest in clamp: dragged `prev` ← target `nestedNext`
 *   - S3 attach above:  dragged `next` → target `prev`
 *
 * The argument domain adds one more case: a dragged `output` tab plugs into a target `input` slot.
 *
 * A dragged `nestedNext` (statement domain) or `input` (argument domain) is not an approved case and
 * is rejected.
 */
function isValidMate(draggedKind: ConnectorKind, targetKind: ConnectorKind): boolean {
    if (draggedKind === 'prev') return targetKind === 'next' || targetKind === 'nestedNext';
    if (draggedKind === 'next') return targetKind === 'prev';
    if (draggedKind === 'output') return targetKind === 'input';
    return false;
}

/**
 * Owns a collision space of TARGET connectors and finds the nearest valid mate for a dragged
 * connector. Targets may be open or occupied (occupied ones enable mid-chain insertion); the mate
 * rules — compatible tab/groove pairing and a different tower — are enforced in `findSnap`.
 */
export class SnapEngine {
    private _space: CollisionSpace;
    private _connectorById = new Map<number, Connector>();
    private _nextId = 0;

    /**
     * @param width       - Canvas width in px; targets outside `[0, width]` are dropped by the space.
     * @param height      - Canvas height in px; targets outside `[0, height]` are dropped by the space.
     * @param createSpace - Factory for the backing collision space (default {@link BruteForceCollisionSpace}),
     *                      injectable so a quadtree-backed space or a test double can be substituted.
     */
    constructor(
        width: number,
        height: number,
        createSpace: (w: number, h: number) => CollisionSpace = (w, h) =>
            new BruteForceCollisionSpace(w, h),
    ) {
        this._space = createSpace(width, height);
        this._space.setOptions({ shape: 'circle', threshold: SNAP_THRESHOLD });
    }

    /**
     * (Re)builds the target space from a connector list, assigning each connector a numeric id and
     * recording the id → connector reverse map.
     */
    public setTargets(connectors: Connector[]): void {
        this._space.reset();
        this._space.setOptions({ shape: 'circle', threshold: SNAP_THRESHOLD });
        this._connectorById.clear();
        this._nextId = 0;

        const objects: CollisionObject[] = [];
        for (const connector of connectors) {
            const id = this._nextId++;
            this._connectorById.set(id, connector);
            objects.push(probeBox(id, connector.bounds));
        }

        this._space.createObjects(objects);
    }

    /**
     * Probes the target space with a dragged connector and returns the NEAREST valid mate by centre
     * distance, or `null` if none is in range. Candidates are filtered to a different tower and a
     * compatible tab/groove pairing; on a tie the earliest-registered target wins.
     */
    public findSnap(dragged: OpenConnector): SnapCandidate | null {
        const probe: CollisionObject = probeBox(PROBE_ID, dragged.bounds);

        let best: SnapCandidate | null = null;

        for (const id of this._space.checkCollision(probe)) {
            const target = this._connectorById.get(id);
            if (target === undefined) continue;

            // Cycle guard: a connector can never mate with one on its own tower.
            if (target.towerId === dragged.towerId) continue;

            // Tab/groove compatibility per the approved spec.
            if (!isValidMate(dragged.kind, target.kind)) continue;

            // Argument domain is EMPTY-ONLY: an occupied `input` slot is skipped so findSnap picks
            // the nearest EMPTY slot (no displace/replace). Statement mates keep occupied targets,
            // where snapping onto one expresses mid-chain insertion.
            if (target.kind === 'input' && target.occupied) continue;

            const distance = Math.hypot(
                target.bounds.x - dragged.bounds.x,
                target.bounds.y - dragged.bounds.y,
            );

            if (best === null || distance < best.distance) {
                best = {
                    targetTowerId: target.towerId,
                    targetNodeId: target.nodeId,
                    targetKind: target.kind,
                    draggedNodeId: dragged.nodeId,
                    draggedKind: dragged.kind,
                    distance,
                    target,
                    dragged,
                };
            }
        }

        return best;
    }
}
