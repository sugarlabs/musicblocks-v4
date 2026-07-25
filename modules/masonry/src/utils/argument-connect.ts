import type { Point } from '@/@types/common.types';
import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import type { ArgumentConnectorMeta, TowerState } from '@/@types/workspace.types';

import type { QuadtreeCollisionSpace } from './collision';
import { querySnap } from './snap-config';
import { findNode } from './tower-traversal';

/** A validated, empty argument slot the dragged tower's output can plug into. */
export interface ArgumentDropTarget {
    /** The tower that owns the slot (the host that will absorb the dragged tower). */
    towerId: string;
    /** The node whose argument slot receives the dragged root. */
    node: TowerExpressionNode | TowerStatementNode;
    /** Index of the slot being filled. */
    slotIndex: number;
}

export interface ResolveArgumentDropParams {
    /** World-space centre of the dragged tower's `output` tab — the point the snap zone is built around. */
    probeCenter: Point;
    /** Id of the dragged tower, excluded so a tower never snaps into its own slots. */
    draggedTowerId: string;
    /** The live argument collision space, populated by the layout sync pass. */
    space: QuadtreeCollisionSpace;
    /** Book-keeping mapping every argument collision-object id to its metadata. */
    connectors: Record<number, ArgumentConnectorMeta>;
    /** All towers currently in the workspace, used to resolve a hit back to its live node. */
    towers: Record<string, TowerState>;
}

/**
 * Resolves the dragged tower's drop into the nearest empty argument slot within snap distance, or
 * null when nothing valid is in range. Implements the issue's query + validate steps:
 *   - Query: collide a `SNAP_DISTANCE` tolerance box around the output tab against the space.
 *   - Validate: keep only `input` hits, on a different tower, whose slot is empty (confirmed against
 *     the live node graph, not just the cached `occupied` flag).
 *   - Rank: pick the slot whose groove centre is closest to the probe.
 *
 * The caller performs the actual splice ({@link joinArg}) and the tower merge.
 */
export function resolveArgumentDrop({
    probeCenter,
    draggedTowerId,
    space,
    connectors,
    towers,
}: ResolveArgumentDropParams): ArgumentDropTarget | null {
    const hits = querySnap(space, probeCenter);

    let best: ArgumentDropTarget | null = null;
    let bestDistance = Infinity;

    for (const hitId of hits) {
        const meta = connectors[hitId];
        if (!meta || meta.type !== 'input' || meta.slotIndex === undefined) continue;

        // A tower never snaps into its own slots.
        if (meta.towerId === draggedTowerId) continue;

        // Empty-only: an occupied slot is not a valid drop target (no displace/replace).
        if (meta.occupied) continue;

        const tower = towers[meta.towerId];
        if (!tower) continue;

        const node = findNode(tower.root, meta.brickId);
        if (!node || (node.kind !== 'expression' && node.kind !== 'statement')) continue;

        // Authoritative empty check against the live graph, in case the cached flag is stale.
        if (node.args[meta.slotIndex] !== null) continue;

        const input = node.model.getConnectorCoords().inputs[meta.slotIndex];
        if (!input) continue;

        // Rank by distance between the probe centre and the slot's groove centre, both in the same
        // absolute canvas frame the space itself is built in (model.position + connector offset).
        const centreX = node.model.position.x + input.x;
        const centreY = node.model.position.y + input.y;
        const distance = Math.hypot(centreX - probeCenter.x, centreY - probeCenter.y);

        if (distance < bestDistance) {
            bestDistance = distance;
            best = { towerId: meta.towerId, node, slotIndex: meta.slotIndex };
        }
    }

    return best;
}

/** Parameters describing a single validated argument-join between two towers. */
export interface ArgJoinParams {
    /** Root of the dragged tower — the value/expression whose output plugs in. */
    draggedRoot: TowerValueNode | TowerExpressionNode;
    /** The target node whose empty argument slot receives the dragged root. */
    target: TowerExpressionNode | TowerStatementNode;
    /** Index of the target's argument slot being filled. */
    slotIndex: number;
}

/**
 * Plugs the dragged value/expression tower into a target's empty argument slot by mutating tower-node
 * pointers in place. Pure with respect to stores and layout — it only edits the node graph (the slot
 * reference and the dragged root's `parent` back-pointer); the caller merges the towers in the store
 * and triggers a re-layout, which sets `argDims`. Arguments carry no notch flags.
 *
 * The caller guarantees the slot is empty (see {@link resolveArgumentDrop}) and that the two towers
 * differ.
 */
export function joinArg({ draggedRoot, target, slotIndex }: ArgJoinParams): void {
    target.args[slotIndex] = draggedRoot;
    draggedRoot.parent = target;
}
