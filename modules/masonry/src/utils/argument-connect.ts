import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import type { ArgumentConnectorMeta, TowerState } from '@/@types/workspace.types';

import type { CollisionSpace } from './collision';
import { querySnap } from './snap-config';
import { findNode } from './tower-traversal';

/** A node that owns argument slots, and can therefore receive an argument. */
export type ArgumentParentNode = TowerExpressionNode | TowerStatementNode;

/** A node with an output tab, and can therefore be plugged into an argument slot. */
export type ArgumentChildNode = TowerValueNode | TowerExpressionNode;

/** A validated argument connection between two towers, ready to be spliced and merged. */
export interface ArgumentConnection {
    /** The node whose argument slot is being filled (may already be occupied). */
    parent: ArgumentParentNode;
    /** The node being plugged into that slot. */
    child: ArgumentChildNode;
    /** Index of the slot being filled. */
    slotIndex: number;
    /** The tower that survives the merge, owning the whole joined graph afterwards. */
    hostTowerId: string;
    /** The tower absorbed into the host, to be dropped from the workspace. */
    absorbedTowerId: string;
    /** Gap between the two connectors at drop time; used to pick between rival connections. */
    distance: number;
    /** The node currently occupying the slot, if any; `null` when the slot is empty. */
    residentNode: ArgumentChildNode | null;
}

export interface ResolveArgumentConnectionParams {
    /** Id of the tower that was just dropped. */
    draggedTowerId: string;
    /** The live argument collision space, populated by the layout sync pass. */
    space: CollisionSpace;
    /** Book-keeping mapping every argument collision-object id to its metadata. */
    connectors: Record<number, ArgumentConnectorMeta>;
    /** All towers currently in the workspace, used to resolve a hit back to its live node. */
    towers: Record<string, TowerState>;
}

/**
 * Direction 1 — the dragged tower plugs itself in: its root's output tab seeks an argument
 * slot (empty or occupied) on a settled tower, which becomes the host. When the slot already holds
 * a brick, that resident is recorded so the caller can evict it before merging. Only the root is
 * considered, since every other brick in the tower already has its output filled.
 */
function resolveOutputIntoSlot(
    dragged: TowerState,
    { space, connectors, towers }: ResolveArgumentConnectionParams,
): ArgumentConnection | null {
    const child = dragged.root;
    if (child.kind !== 'value' && child.kind !== 'expression') return null;

    const { output } = child.model.getConnectorCoords();
    if (!output) return null;

    // A tower's root sits exactly at its origin, so its offset within the tower is zero.
    const probe = { x: dragged.position.x + output.x, y: dragged.position.y + output.y };

    let best: ArgumentConnection | null = null;

    for (const hitId of querySnap(space, probe)) {
        const meta = connectors[hitId];
        if (!meta || meta.type !== 'input' || meta.slotIndex === undefined) continue;

        // A tower never plugs into a slot it already owns.
        if (meta.towerId === dragged.id) continue;

        const host = towers[meta.towerId];
        if (!host) continue;

        const parent = findNode(host.root, meta.brickId);
        if (!parent || (parent.kind !== 'expression' && parent.kind !== 'statement')) continue;

        const residentNode = parent.args[meta.slotIndex] as ArgumentChildNode | null;

        const input = parent.model.getConnectorCoords().inputs[meta.slotIndex];
        if (!input) continue;

        const distance = Math.hypot(
            parent.model.position.x + input.x - probe.x,
            parent.model.position.y + input.y - probe.y,
        );

        if (best === null || distance < best.distance) {
            best = {
                parent,
                child,
                slotIndex: meta.slotIndex,
                hostTowerId: host.id,
                absorbedTowerId: dragged.id,
                distance,
                residentNode,
            };
        }
    }

    return best;
}

/**
 * Resolves a dropped tower into an argument connection with a settled tower, or null when nothing
 * valid is within snap distance. Only the output-into-slot direction is tried: the dragged tower's
 * root output tab seeks an argument slot on a settled tower.
 *
 * Slot emptiness and output freedom are read off the live node graph, not the collision metadata, so
 * a connector point that has not been re-synced since its slot was filled cannot mislead this.
 *
 * @returns The connection to apply via {@link joinArg}, or null if the drop joins nothing.
 */
export function resolveArgumentConnection(
    params: ResolveArgumentConnectionParams,
): ArgumentConnection | null {
    const dragged = params.towers[params.draggedTowerId];
    if (!dragged) return null;

    return resolveOutputIntoSlot(dragged, params);
}

/**
 * Plugs `child` into `parent`'s argument slot by editing tower-node pointers in place. Pure
 * with respect to stores and layout: the caller merges the two towers, which re-runs the layout and
 * thereby recomputes the parent's `argDims` and outline.
 *
 * When the slot is occupied, the caller is responsible for evicting the resident first (via
 * `detachBrickToNewTower` in the hook layer); see {@link resolveArgumentConnection}.
 */
export function joinArg({
    parent,
    child,
    slotIndex,
}: {
    parent: ArgumentParentNode;
    child: ArgumentChildNode;
    slotIndex: number;
}): void {
    parent.args[slotIndex] = child;
    child.parent = parent;
}
