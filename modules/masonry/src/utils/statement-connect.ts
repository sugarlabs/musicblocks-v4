import type { Point } from '@/@types/common.types';
import type { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { StatementConnectorMeta, TowerState } from '@/@types/workspace.types';

import type { QuadtreeCollisionSpace } from './collision';
import { querySnap } from './snap-config';
import { TAIL_INDENT_W, V_NOTCH_OFFSET_X } from './statement-collision';
import { findNode, findTail } from './tower-traversal';

/** The connector type on a target statement a dragged end may match. */
type TargetKind = StatementConnectorMeta['type']; // 'prev' | 'next' | 'nestedNext'

/**
 * Which connector on the DRAGGED tower was probed. A moving tower snaps only by one of its two
 * outer ends — its root `prev` groove or its outer tail `next` tab — never by a `nestedNext`.
 */
export type DraggedKind = 'prev' | 'next';

/** A dragged tower's open end, resolved to an absolute canvas point. */
export interface StatementProbe {
    kind: DraggedKind;
    point: Point;
}

/** A validated statement snap: the mate to splice and the tower that will absorb the dragged one. */
export interface StatementJoinPlan {
    targetTowerId: string;
    draggedRoot: TowerStatementNode;
    target: TowerStatementNode;
    draggedKind: DraggedKind;
    targetKind: TargetKind;
}

/**
 * Whether a dragged end may mate with a target connector, per the approved spec — tabs plug into
 * grooves, never tab↔tab or groove↔groove (`prev` is a groove; `next`/`nestedNext` are tabs):
 *   - S1 stack below:   dragged `prev` ← target `next`
 *   - S2 nest in clamp: dragged `prev` ← target `nestedNext`
 *   - S3 attach above:  dragged `next` → target `prev`
 */
function isValidMate(draggedKind: DraggedKind, targetKind: TargetKind): boolean {
    if (draggedKind === 'prev') return targetKind === 'next' || targetKind === 'nestedNext';
    return targetKind === 'prev'; // draggedKind === 'next'
}

/**
 * The absolute canvas point of a statement connector, measured with the SAME geometry
 * `extractStatementConnectors` builds its collision targets from, so probe and targets align.
 */
function statementConnectorPoint(node: TowerStatementNode, kind: TargetKind): Point {
    const { x, y } = node.model.position;
    if (kind === 'prev') return { x: x + V_NOTCH_OFFSET_X, y };
    if (kind === 'next') return { x: x + V_NOTCH_OFFSET_X, y: y + node.model.dims.h };
    // nestedNext — cavity-roof tab, indented and dropped to where the roof starts.
    return { x: x + TAIL_INDENT_W + V_NOTCH_OFFSET_X, y: y + (node.model.bounds.nesting?.y ?? 0) };
}

/**
 * Collects the dragged statement tower's two probe connectors — its root `prev` groove (open top
 * end) and its outer tail `next` tab (open bottom end) — resolved to absolute canvas points using
 * the drop-time `coords`. Each is emitted only when open (no neighbour) and placed. A non-statement
 * root yields nothing (it snaps by its `output`, handled in the argument domain).
 */
export function collectStatementProbes(
    root: TowerNode,
    coords: Record<string, Point>,
): StatementProbe[] {
    if (root.kind !== 'statement') return [];

    const probes: StatementProbe[] = [];

    const rootTopLeft = coords[root.model.id];
    if (root.prev === null && rootTopLeft) {
        probes.push({
            kind: 'prev',
            point: { x: rootTopLeft.x + V_NOTCH_OFFSET_X, y: rootTopLeft.y },
        });
    }

    const tail = findTail(root);
    const tailTopLeft = coords[tail.model.id];
    if (tail.next === null && tailTopLeft) {
        probes.push({
            kind: 'next',
            point: { x: tailTopLeft.x + V_NOTCH_OFFSET_X, y: tailTopLeft.y + tail.model.dims.h },
        });
    }

    return probes;
}

export interface ResolveStatementDropParams {
    /** Root of the dragged statement tower — spliced into the target on a match. */
    draggedRoot: TowerStatementNode;
    /** The dragged tower's open-end probes (see {@link collectStatementProbes}). */
    probes: StatementProbe[];
    /** Id of the dragged tower, excluded so a tower never snaps onto itself. */
    draggedTowerId: string;
    /** The live statement collision space, populated by the layout sync pass. */
    space: QuadtreeCollisionSpace;
    /** Book-keeping mapping every statement collision-object id to its metadata. */
    connectors: Record<number, StatementConnectorMeta>;
    /** All towers currently in the workspace, used to resolve a hit back to its live node. */
    towers: Record<string, TowerState>;
}

/**
 * Resolves the dragged tower's drop into the nearest valid statement mate within snap distance, or
 * null when nothing valid is in range. Query each open-end probe against the space, keep only hits
 * on a different tower with a compatible tab/groove pairing, and pick the closest.
 */
export function resolveStatementDrop({
    draggedRoot,
    probes,
    draggedTowerId,
    space,
    connectors,
    towers,
}: ResolveStatementDropParams): StatementJoinPlan | null {
    let best: StatementJoinPlan | null = null;
    let bestDistance = Infinity;

    for (const probe of probes) {
        for (const hitId of querySnap(space, probe.point)) {
            const meta = connectors[hitId];
            if (!meta || meta.towerId === draggedTowerId) continue;
            if (!isValidMate(probe.kind, meta.type)) continue;

            const tower = towers[meta.towerId];
            if (!tower) continue;

            const node = findNode(tower.root, meta.brickId);
            if (!node || node.kind !== 'statement') continue;

            const targetPoint = statementConnectorPoint(node, meta.type);
            const distance = Math.hypot(
                targetPoint.x - probe.point.x,
                targetPoint.y - probe.point.y,
            );

            if (distance < bestDistance) {
                bestDistance = distance;
                best = {
                    targetTowerId: meta.towerId,
                    draggedRoot,
                    target: node,
                    draggedKind: probe.kind,
                    targetKind: meta.type,
                };
            }
        }
    }

    return best;
}

/**
 * Reconnects a displaced successor (the node that used to follow the target) onto the dragged
 * tower's tail, completing a mid-chain insertion. No-op when there was no successor.
 */
function spliceSuccessor(
    draggedTail: TowerStatementNode,
    displaced: TowerStatementNode | null,
): void {
    if (displaced === null) return;

    draggedTail.next = displaced;
    displaced.prev = draggedTail;
    draggedTail.model.hasConnectionNext = true;
    displaced.model.hasConnectionPrev = true;
}

/**
 * Splices the dragged tower into the target by mutating tower-node pointers in place, per the
 * approved spec (S1/S2/S3 below). Pure with respect to stores and layout — it only edits the node
 * graph and the affected models' notch flags; the caller merges the towers in the store and
 * triggers a re-layout.
 */
export function joinTowers(plan: StatementJoinPlan): void {
    const { draggedRoot, target, draggedKind, targetKind } = plan;
    const draggedTail = findTail(draggedRoot);

    // S1 — dragged root `prev` groove ← target `next` tab (stack below / insert below).
    if (draggedKind === 'prev' && targetKind === 'next') {
        const displaced = target.next;

        target.next = draggedRoot;
        draggedRoot.prev = target;
        target.model.hasConnectionNext = true;
        draggedRoot.model.hasConnectionPrev = true;

        spliceSuccessor(draggedTail, displaced?.kind === 'statement' ? displaced : null);
        return;
    }

    // S2 — dragged root `prev` groove ← target `nestedNext` tab (nest in clamp / insert at head).
    if (draggedKind === 'prev' && targetKind === 'nestedNext') {
        const displaced = target.nestedNext ?? null;

        target.nestedNext = draggedRoot;
        draggedRoot.prev = target;
        draggedRoot.model.hasConnectionPrev = true;

        spliceSuccessor(draggedTail, displaced?.kind === 'statement' ? displaced : null);
        return;
    }

    // S3 — dragged tail `next` tab → target `prev` groove (attach above / insert above).
    if (draggedKind === 'next' && targetKind === 'prev') {
        const displaced = target.prev;

        draggedTail.next = target;
        target.prev = draggedTail;
        draggedTail.model.hasConnectionNext = true;
        target.model.hasConnectionPrev = true;

        if (displaced !== null && displaced.kind === 'statement') {
            displaced.next = draggedRoot;
            draggedRoot.prev = displaced;
            displaced.model.hasConnectionNext = true;
            draggedRoot.model.hasConnectionPrev = true;
        }
        return;
    }

    throw new Error(
        `joinTowers: unsupported mating dragged '${draggedKind}' → target '${targetKind}'`,
    );
}
