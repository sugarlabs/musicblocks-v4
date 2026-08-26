import type { TowerStatementNode } from '@/@types/tower.types';
import type { StatementConnectorMeta, TowerState } from '@/@types/workspace.types';

import type { CollisionSpace } from './collision';
import { connectorCenter, querySnap } from './snap-config';
import { findNode, hidesCavity, listVisibleNodes } from './tower-traversal';

/** The two tabs a statement can carry the sequence onward through; both mate with a `prev` groove. */
export type StatementSocket = 'next' | 'nestedNext';

/** A validated statement connection between two towers, ready to be linked and merged. */
export interface StatementConnection {
    /** The statement whose free `next` or `nestedNext` tab is being filled. */
    parent: TowerStatementNode;
    /** The statement being hung off that tab; the root of its own tower until the merge. */
    child: TowerStatementNode;
    /** Which of the parent's two tabs the child attaches to. */
    socket: StatementSocket;
    /** The tower that survives the merge, owning the whole joined graph afterwards. */
    hostTowerId: string;
    /** The tower absorbed into the host, to be dropped from the workspace. */
    absorbedTowerId: string;
    /** Gap between the two connectors at drop time; used to pick between rival connections. */
    distance: number;
}

export interface ResolveStatementConnectionParams {
    /** Id of the tower that was just dropped. */
    draggedTowerId: string;
    /** The live statement collision space, populated by the layout sync pass. */
    space: CollisionSpace;
    /** Book-keeping mapping every statement collision-object id to its metadata. */
    connectors: Record<number, StatementConnectorMeta>;
    /** All towers currently in the workspace, used to resolve a hit back to its live node. */
    towers: Record<string, TowerState>;
}

const SOCKETS: StatementSocket[] = ['next', 'nestedNext'];

/**
 * Whether `parent`'s `socket` tab is free to take a brick. A `nestedNext` of `undefined` means the
 * brick has no cavity at all rather than an empty one, so only an explicit `null` is a candidate.
 *
 * A folded cavity is never free, however empty it is: it is shut, so a brick dropped into it would
 * vanish where it landed. The folded outline reports no roof notch to aim at either, so this states
 * the rule where a socket's freedom is decided rather than leaving it to the geometry.
 */
function isSocketFree(parent: TowerStatementNode, socket: StatementSocket): boolean {
    if (socket === 'next') return parent.next === null;

    return parent.nestedNext === null && !hidesCavity(parent);
}

/**
 * Direction 1 — the dragged tower hangs itself below: its root's `prev` groove seeks a free `next`
 * or `nestedNext` tab on a settled tower, which becomes the host. Only the root is considered, since
 * every other statement in the tower already has the brick above it filling its `prev`.
 */
function resolvePrevOntoTab(
    dragged: TowerState,
    { space, connectors, towers }: ResolveStatementConnectionParams,
): StatementConnection | null {
    const child = dragged.root;
    if (child.kind !== 'statement') return null;

    const { prev } = child.model.getConnectorCoords();
    if (!prev) return null;

    // A tower's root sits exactly at its origin, so its offset within the tower is zero.
    const probe = { x: dragged.position.x + prev.x, y: dragged.position.y + prev.y };

    let best: StatementConnection | null = null;

    for (const hitId of querySnap(space, probe)) {
        const meta = connectors[hitId];
        if (!meta || meta.type === 'prev') continue;

        // A tower never hangs off a tab it already owns.
        if (meta.towerId === dragged.id) continue;

        const host = towers[meta.towerId];
        if (!host) continue;

        const parent = findNode(host.root, meta.brickId);
        if (parent === null || parent.kind !== 'statement') continue;

        // Empty-only: no insertion between two bricks that are already linked.
        if (!isSocketFree(parent, meta.type)) continue;

        const tab = parent.model.getConnectorCoords()[meta.type];
        if (!tab) continue;

        const distance = Math.hypot(
            parent.model.position.x + tab.x - probe.x,
            parent.model.position.y + tab.y - probe.y,
        );

        if (best === null || distance < best.distance) {
            best = {
                parent,
                child,
                socket: meta.type,
                hostTowerId: host.id,
                absorbedTowerId: dragged.id,
                distance,
            };
        }
    }

    return best;
}

/**
 * Direction 2 — the dragged tower picks something up: one of its own free `next` or `nestedNext`
 * tabs seeks the `prev` groove of a settled tower, which is absorbed into it. Every free tab in the
 * dragged tower is a candidate, not just its outer tail's, since an empty cavity is equally free.
 *
 * Only what the drag carries in plain sight, though: a brick hidden inside a folded cavity offers
 * no tab, since it is drawn nowhere and its recorded position is wherever the layout left it before
 * the fold shut over it. It offers its tabs again when the fold is lifted.
 */
function resolveTabOntoPrev(
    dragged: TowerState,
    { space, connectors, towers }: ResolveStatementConnectionParams,
): StatementConnection | null {
    let best: StatementConnection | null = null;

    for (const parent of listVisibleNodes(dragged.root)) {
        if (parent.kind !== 'statement') continue;

        const coords = parent.model.getConnectorCoords();

        for (const socket of SOCKETS) {
            if (!isSocketFree(parent, socket)) continue;

            const tab = coords[socket];
            if (!tab) continue;

            const probe = connectorCenter(dragged.root, parent, dragged.position, tab);

            for (const hitId of querySnap(space, probe)) {
                const meta = connectors[hitId];
                if (!meta || meta.type !== 'prev') continue;

                // A tower never picks up a brick it already contains.
                if (meta.towerId === dragged.id) continue;

                const absorbed = towers[meta.towerId];
                if (!absorbed) continue;

                // Only a whole tower can be picked up, so the groove must be its root's: any other
                // brick's `prev` is taken by the brick above it, a cavity head's by its clamp.
                const child = absorbed.root;
                if (child.model.id !== meta.brickId) continue;
                if (child.kind !== 'statement') continue;

                const { prev } = child.model.getConnectorCoords();
                if (!prev) continue;

                const distance = Math.hypot(
                    child.model.position.x + prev.x - probe.x,
                    child.model.position.y + prev.y - probe.y,
                );

                if (best === null || distance < best.distance) {
                    best = {
                        parent,
                        child,
                        socket,
                        hostTowerId: dragged.id,
                        absorbedTowerId: absorbed.id,
                        distance,
                    };
                }
            }
        }
    }

    return best;
}

/**
 * Resolves a dropped tower into a statement connection with a settled tower, or null when nothing
 * valid is within snap distance. Both directions are tried, so which end of a sequence the user
 * happened to drag does not decide whether the two can join; a statement has a groove above and a
 * tab below, so when both are in range the closer pairing wins.
 *
 * Whether a notch is free is read off the live node graph, not the collision metadata, so a
 * connector point that has not been re-synced since its notch was filled cannot mislead this.
 *
 * @returns The connection to apply via {@link joinStatement}, or null if the drop joins nothing.
 */
export function resolveStatementConnection(
    params: ResolveStatementConnectionParams,
): StatementConnection | null {
    const dragged = params.towers[params.draggedTowerId];
    if (!dragged) return null;

    const hangBelow = resolvePrevOntoTab(dragged, params);
    const pickUp = resolveTabOntoPrev(dragged, params);

    if (hangBelow === null) return pickUp;
    if (pickUp === null) return hangBelow;

    return pickUp.distance < hangBelow.distance ? pickUp : hangBelow;
}

/**
 * Links `child` onto `parent`'s free `next` or `nestedNext` tab by editing tower-node pointers in
 * place. Pure with respect to stores and layout: the caller merges the two towers, which re-runs the
 * layout and thereby recomputes the parent's `nestingDims` and outline.
 *
 * `prev` back-points at the parent for both sockets, so a cavity head is reachable upward too.
 *
 * The caller guarantees the tab is free and that the two nodes come from different towers; see
 * {@link resolveStatementConnection}.
 */
export function joinStatement({
    parent,
    child,
    socket,
}: {
    parent: TowerStatementNode;
    child: TowerStatementNode;
    socket: StatementSocket;
}): void {
    if (socket === 'next') {
        parent.next = child;
    } else {
        parent.nestedNext = child;
    }

    child.prev = parent;
}
