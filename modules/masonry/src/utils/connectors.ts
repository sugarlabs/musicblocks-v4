import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';

import { findTail, listNodes } from './tower-traversal';

/**
 * Connector origin for resolving connectors from the brick layout store, whose `coords` are already
 * absolute canvas positions (`useTowerLayout` bakes each tower's origin into every brick's
 * top-left). So the origin is (0, 0) — adding the tower `position` again would double-count it.
 * Shared by the drag probe collection (`useBrickMove`) and the snap target build (`stores/snap`) so
 * both measure connectors the same way.
 */
export const ORIGIN: Point = { x: 0, y: 0 };

/**
 * Every connector kind a tower can expose, across both snapping domains:
 *   - Statement domain (sequence snapping): `prev` | `next` | `nestedNext`.
 *   - Argument domain (arg snapping): `output` — the left-edge tab on a value/expression brick that
 *     plugs into a parent's argument slot; `input` — an argument slot on an expression/statement
 *     brick that accepts such a tab.
 */
export type ConnectorKind = 'prev' | 'next' | 'nestedNext' | 'output' | 'input';

/**
 * An OPEN connector on a tower, resolved into absolute canvas (world) space. "Open" means the
 * corresponding model pointer is unoccupied, so the connector is free to mate with another tower's:
 *   - `prev`       — no predecessor (`prev === null`)
 *   - `next`       — no successor (`next === null`)
 *   - `nestedNext` — an empty nesting cavity (`nestedNext === null`)
 */
export interface OpenConnector {
    /** Id of the tower this connector belongs to. */
    towerId: string;
    /** Id of the node (brick) the connector sits on. */
    nodeId: string;
    /** Which sequence connector this is. */
    kind: ConnectorKind;
    /** Connector centroid in absolute canvas (world) pixels. */
    point: Point;
    /**
     * Present only on `input` connectors: the declaration-order index of the argument slot, used to
     * resolve the connector back to `node.args[slotIndex]`.
     */
    slotIndex?: number;
}

/**
 * A statement-domain sequence connector in absolute canvas space, tagged with whether its model
 * pointer is already occupied. This is the shape used for SNAP TARGETS, where both matter:
 *   - `occupied === false` — a free chain end, available to mate directly.
 *   - `occupied === true`  — already linked; still a valid target, but snapping onto it means
 *     MID-CHAIN INSERTION (the join step splices the dragged tower in and reconnects the displaced
 *     neighbour to its tail).
 */
export interface Connector extends OpenConnector {
    /** Whether this connector's model pointer already points at a neighbour. */
    occupied: boolean;
}

/**
 * Resolves a connector to absolute canvas (world) space as the sum of three offsets:
 *   `origin` + brick top-left px + connector px offset (from `getConnectorCoords()`).
 * Shared by every connector collector so they all measure connectors the same way.
 */
function toWorld(origin: Point, topLeft: Point, offset: Point): Point {
    return {
        x: origin.x + topLeft.x + offset.x,
        y: origin.y + topLeft.y + offset.y,
    };
}

/**
 * Collects every statement-domain sequence connector in a tower (open AND occupied), resolved to
 * absolute canvas space, so the result is suitable as the SNAP TARGET set — snapping onto an
 * occupied connector is how mid-chain insertion is expressed.
 *
 * Pure: the caller supplies per-brick top-lefts via `coords`; this never reads a store. A
 * connector's world point is the sum of three offsets:
 *   `origin` + brick top-left px (`coords[nodeId]`) + connector px offset (`getConnectorCoords()`)
 *
 * Only statement nodes carry sequence connectors; a node missing from `coords` is skipped (it
 * cannot be placed in world space yet).
 *
 * @param root    - Root node of the tower tree.
 * @param origin  - The tower's origin in canvas px; every connector is measured relative to it.
 * @param coords  - Map of brick id → the brick's top-left position in canvas px.
 * @param towerId - Id of the tower, passed through onto every emitted connector.
 */
export function collectConnectors(
    root: TowerNode,
    origin: Point,
    coords: Record<string, Point>,
    towerId: string,
): Connector[] {
    const connectors: Connector[] = [];

    for (const node of listNodes(root)) {
        if (node.kind !== 'statement') continue;

        const topLeft = coords[node.model.id];
        if (!topLeft) continue;

        const offsets = node.model.getConnectorCoords();

        // prev groove — occupied when the node already has a predecessor.
        if (offsets.prev) {
            connectors.push({
                towerId,
                nodeId: node.model.id,
                kind: 'prev',
                point: toWorld(origin, topLeft, offsets.prev),
                occupied: node.prev !== null,
            });
        }

        // next tab — occupied when the node already has a successor.
        if (offsets.next) {
            connectors.push({
                towerId,
                nodeId: node.model.id,
                kind: 'next',
                point: toWorld(origin, topLeft, offsets.next),
                occupied: node.next !== null,
            });
        }

        // nestedNext cavity-roof tab — present only when the node has a cavity
        // (nestedNext !== undefined); occupied when the cavity already holds a head.
        if (node.nestedNext !== undefined && offsets.nestedNext) {
            connectors.push({
                towerId,
                nodeId: node.model.id,
                kind: 'nestedNext',
                point: toWorld(origin, topLeft, offsets.nestedNext),
                occupied: node.nestedNext !== null,
            });
        }
    }

    return connectors;
}

/**
 * Collects every argument-domain connector in a tower (open AND occupied), resolved to absolute
 * canvas space, so the result is suitable as the SNAP TARGET set for arg snapping. Mirrors
 * {@link collectConnectors} but over the argument domain:
 *   - `input`  — one per argument slot on an expression/statement node (filled and empty), tagged
 *                with its `slotIndex`; occupied when `node.args[slotIndex]` already holds a child.
 *   - `output` — the left-edge tab on a value/expression node; occupied when the node already has a
 *                `parent`.
 *
 * Both open and occupied connectors are emitted — #698 populates the space with ALL argument
 * connectors; filtering to empty slots is the join step's concern.
 *
 * Pure: the caller supplies per-brick top-lefts via `coords`; this never reads a store. A
 * connector's world point is the sum of three offsets:
 *   `origin` + brick top-left px (`coords[nodeId]`) + connector px offset (`getConnectorCoords()`)
 *
 * Occupancy is derived from the NODE GRAPH (`node.args` / `node.parent`), the authoritative source,
 * not from the model's `filled` flag. A node missing from `coords` is skipped (it cannot be placed
 * in world space yet).
 *
 * @param root    - Root node of the tower tree.
 * @param origin  - The tower's origin in canvas px; every connector is measured relative to it.
 * @param coords  - Map of brick id → the brick's top-left position in canvas px.
 * @param towerId - Id of the tower, passed through onto every emitted connector.
 */
export function collectArgConnectors(
    root: TowerNode,
    origin: Point,
    coords: Record<string, Point>,
    towerId: string,
): Connector[] {
    const connectors: Connector[] = [];

    for (const node of listNodes(root)) {
        const topLeft = coords[node.model.id];
        if (!topLeft) continue;

        const offsets = node.model.getConnectorCoords();

        // input grooves — one per argument slot; occupied when the slot already holds a child.
        if (node.kind === 'expression' || node.kind === 'statement') {
            for (const input of offsets.inputs) {
                connectors.push({
                    towerId,
                    nodeId: node.model.id,
                    kind: 'input',
                    point: toWorld(origin, topLeft, input.point),
                    slotIndex: input.index,
                    occupied: node.args[input.index] !== null,
                });
            }
        }

        // output tab — present only when the node can produce a value; occupied when already plugged
        // into a parent.
        if (node.kind === 'value' || node.kind === 'expression') {
            if (offsets.output) {
                connectors.push({
                    towerId,
                    nodeId: node.model.id,
                    kind: 'output',
                    point: toWorld(origin, topLeft, offsets.output),
                    occupied: node.parent !== null,
                });
            }
        }
    }

    return connectors;
}

/**
 * Collects only the OPEN statement-domain connectors in a tower (the free chain ends) — derived
 * from {@link collectConnectors} by dropping the occupied ones. See it for parameter meanings.
 */
export function collectOpenConnectors(
    root: TowerNode,
    origin: Point,
    coords: Record<string, Point>,
    towerId: string,
): OpenConnector[] {
    return collectConnectors(root, origin, coords, towerId)
        .filter((connector) => !connector.occupied)
        .map(
            (connector): OpenConnector => ({
                towerId: connector.towerId,
                nodeId: connector.nodeId,
                kind: connector.kind,
                point: connector.point,
            }),
        );
}

/**
 * Collects the DRAGGED tower's probe connectors — the connectors a moving tower snaps WITH (per the
 * approved spec: a tower snaps by an outer END, never by its middle or an inner cavity), resolved to
 * absolute canvas space and kept only when open:
 *   - Statement root: its ROOT `prev` groove and its outer TAIL `next` tab (up to two).
 *   - Value/expression root: its single `output` tab — the argument-domain mirror of the "outer
 *     ends only" rule (such a tower has no sequence ends, only an output to plug into a parent).
 *
 * See {@link collectConnectors} for parameter meanings. Returns the open probes (each omitted when
 * absent or already occupied).
 */
export function collectProbeConnectors(
    root: TowerNode,
    origin: Point,
    coords: Record<string, Point>,
    towerId: string,
): OpenConnector[] {
    // Argument-domain probe: a value/expression tower probes by its own `output` tab, emitted only
    // when the root is free (no parent), placed, and the model exposes an output offset.
    if (root.kind === 'value' || root.kind === 'expression') {
        const rootTopLeft = coords[root.model.id];
        const rootOutput = root.model.getConnectorCoords().output;
        if (root.parent === null && rootTopLeft && rootOutput) {
            return [
                {
                    towerId,
                    nodeId: root.model.id,
                    kind: 'output',
                    point: toWorld(origin, rootTopLeft, rootOutput),
                },
            ];
        }
        return [];
    }

    if (root.kind !== 'statement') return [];

    const tail = findTail(root);
    const probes: OpenConnector[] = [];

    // Root `prev` groove — the tower's open TOP end; emitted only when open and placed.
    const rootTopLeft = coords[root.model.id];
    const rootPrev = root.model.getConnectorCoords().prev;
    if (root.prev === null && rootTopLeft && rootPrev) {
        probes.push({
            towerId,
            nodeId: root.model.id,
            kind: 'prev',
            point: toWorld(origin, rootTopLeft, rootPrev),
        });
    }

    // Outer tail `next` tab — the tower's open BOTTOM end; emitted only when open and placed.
    const tailTopLeft = coords[tail.model.id];
    const tailNext = tail.model.getConnectorCoords().next;
    if (tail.next === null && tailTopLeft && tailNext) {
        probes.push({
            towerId,
            nodeId: tail.model.id,
            kind: 'next',
            point: toWorld(origin, tailTopLeft, tailNext),
        });
    }

    return probes;
}
