import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';

import type { ConnectorKind } from './connectors';
import { findTail } from './tower-traversal';

/**
 * Which connector on the DRAGGED tower was probed. A moving tower snaps only by one of its two
 * outer ends — its root `prev` groove or its outer tail `next` tab — never by a `nestedNext`.
 */
export type DraggedKind = Extract<ConnectorKind, 'prev' | 'next'>;

/** Parameters describing a single validated snap-join between two towers. */
export interface JoinParams {
    /** Root node of the dragged (moving) tower. */
    draggedRoot: TowerStatementNode;
    /** The target node on the stationary tower whose connector was matched. */
    target: TowerStatementNode;
    /** Which connector on the dragged tower was probed (its root `prev` or its outer tail `next`). */
    draggedKind: DraggedKind;
    /** Which connector on the target was matched. */
    targetKind: ConnectorKind;
}

/**
 * Reconnects a displaced successor (the node that used to follow the target) onto the dragged
 * tower's tail, completing a mid-chain insertion. No-op when there was no successor.
 *
 * Only statement successors are spliced — sequence `next`/`nestedNext` pointers always reference a
 * statement in practice, and a non-statement cannot carry a `prev` back-pointer.
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
 * approved spec (see the S1/S2/S3 cases inline below). Pure with respect to stores and layout — it
 * only edits the node graph and the affected models' notch flags (`hasConnectionPrev`/`Next`, so
 * notches render); the caller merges the towers in the store and triggers a re-layout.
 */
export function joinTowers(params: JoinParams): void {
    const { draggedRoot, target, draggedKind, targetKind } = params;
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
        // The nested cavity head's `prev` back-pointer points at the clamp brick.
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
            // Insert above: the displaced predecessor now precedes the dragged root.
            displaced.next = draggedRoot;
            draggedRoot.prev = displaced;
            displaced.model.hasConnectionNext = true;
            draggedRoot.model.hasConnectionPrev = true;
        }
        return;
    }

    // Any other pairing is not an approved mating and should have been rejected upstream by
    // `SnapEngine.findSnap`; reaching here means a bug in the caller.
    throw new Error(
        `joinTowers: unsupported mating dragged '${draggedKind}' → target '${targetKind}'`,
    );
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
 * The caller guarantees the slot is empty (`SnapEngine.findSnap` filters out occupied slots) and that
 * the two towers differ.
 */
export function joinArg({ draggedRoot, target, slotIndex }: ArgJoinParams): void {
    target.args[slotIndex] = draggedRoot;
    draggedRoot.parent = target;
}
