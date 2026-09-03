import type { TowerExpressionNode, TowerStatementNode, TowerValueNode } from '@/@types/tower.types';
import type { ArgumentConnectorMeta, TowerState } from '@/@types/workspace.types';

import type { CollisionSpace } from './collision';
import { connectorCenter, querySnap } from './snap-config';
import { findNode, listVisibleNodes } from './tower-traversal';

/** A node that owns argument slots, and can therefore receive an argument. */
export type ArgumentParentNode = TowerExpressionNode | TowerStatementNode;

/** A node with an output tab, and can therefore be plugged into an argument slot. */
export type ArgumentChildNode = TowerValueNode | TowerExpressionNode;

/** A validated argument connection between two towers, ready to be spliced and merged. */
export interface ArgumentConnection {
    /** The node whose empty argument slot is being filled. */
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
 * Direction 1 — the dragged tower plugs itself in: its root's output tab seeks an empty argument
 * slot on a settled tower, which becomes the host. Only the root is considered, since every other
 * brick in the tower already has its output filled.
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

        // Empty-only: no displace, no replace.
        if (parent.args[meta.slotIndex] !== null) continue;

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
            };
        }
    }

    return best;
}

/**
 * Direction 2 — the dragged tower picks something up: one of its own empty argument slots seeks the
 * free output tab of a settled tower, which is absorbed into it. Every empty slot in the dragged
 * tower is a candidate, not just the root's, since all of them are equally free to be filled.
 *
 * Only the slots the drag carries in plain sight, though: a brick hidden inside a folded cavity
 * offers none, since it is drawn nowhere and its recorded position is wherever the layout left it
 * before the fold shut over it. Its slots are open to a drop again when the fold is lifted.
 */
function resolveSlotOntoOutput(
    dragged: TowerState,
    { space, connectors, towers }: ResolveArgumentConnectionParams,
): ArgumentConnection | null {
    let best: ArgumentConnection | null = null;

    for (const parent of listVisibleNodes(dragged.root)) {
        if (parent.kind !== 'expression' && parent.kind !== 'statement') continue;

        const inputs = parent.model.getConnectorCoords().inputs;

        parent.args.forEach((arg, slotIndex) => {
            if (arg !== null) return;

            const input = inputs[slotIndex];
            if (!input) return;

            const probe = connectorCenter(dragged.root, parent, dragged.position, input);

            for (const hitId of querySnap(space, probe)) {
                const meta = connectors[hitId];
                if (!meta || meta.type !== 'output') continue;

                // A tower never picks up a brick it already contains.
                if (meta.towerId === dragged.id) continue;

                const absorbed = towers[meta.towerId];
                if (!absorbed) continue;

                // Only a whole tower can be picked up, so the output must be its root's: any other
                // brick's output is already plugged into the slot above it.
                const child = absorbed.root;
                if (child.model.id !== meta.brickId) continue;
                if (child.kind !== 'value' && child.kind !== 'expression') continue;

                const { output } = child.model.getConnectorCoords();
                if (!output) continue;

                const distance = Math.hypot(
                    child.model.position.x + output.x - probe.x,
                    child.model.position.y + output.y - probe.y,
                );

                if (best === null || distance < best.distance) {
                    best = {
                        parent,
                        child,
                        slotIndex,
                        hostTowerId: dragged.id,
                        absorbedTowerId: absorbed.id,
                        distance,
                    };
                }
            }
        });
    }

    return best;
}

/**
 * Resolves a dropped tower into an argument connection with a settled tower, or null when nothing
 * valid is within snap distance. Both directions are tried, so which brick the user happened to drag
 * does not decide whether the two can join; an expression has both an output tab and slots of its
 * own, so when both are in range the closer pairing wins.
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

    const plugIn = resolveOutputIntoSlot(dragged, params);
    const pickUp = resolveSlotOntoOutput(dragged, params);

    if (plugIn === null) return pickUp;
    if (pickUp === null) return plugIn;

    return pickUp.distance < plugIn.distance ? pickUp : plugIn;
}

/**
 * Plugs `child` into `parent`'s empty argument slot by editing tower-node pointers in place. Pure
 * with respect to stores and layout: the caller merges the two towers, which re-runs the layout and
 * thereby recomputes the parent's `argDims` and outline.
 *
 * The caller guarantees the slot is empty and that the two nodes come from different towers; see
 * {@link resolveArgumentConnection}.
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
