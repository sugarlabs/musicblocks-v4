import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';

import { useBrickLayoutStore } from '@/stores/brick';
import { useWorkspaceStore } from '@/stores/workspace';
import { joinArg, resolveArgumentDrop } from '@/utils/argument-connect';
import {
    collectStatementProbes,
    joinTowers,
    resolveStatementDrop,
} from '@/utils/statement-connect';
import { listNodes } from '@/utils/tower-traversal';

/** A single dragged node: its positioned DOM element and where it started. */
interface DraggedNode {
    /** The brick's positioned DOM element, translated straight to the DOM during `move`. */
    el: HTMLElement;
    /** The brick's top-left position at drag start. */
    start: Point;
}

/** Per-drag bookkeeping, captured at `start` and consumed through `move` and `end`. */
interface DragState {
    /** Id of the tower the grabbed brick belongs to. */
    towerId: string;
    /** The tower's origin at drag start, used to reconcile its final position on drop. */
    towerStart: Point;
    /** Every dragged node's DOM element and start position, keyed by brick id. */
    nodes: Record<string, DraggedNode>;
}

/** A resolved owning tower together with the node list computed while locating the brick. */
interface OwningTower {
    tower: TowerState;
    nodes: TowerNode[];
}

/**
 * Finds the workspace tower whose node graph contains the brick with the given id, returning both
 * the tower AND the node list computed while searching so the caller can reuse it.
 */
function findTower(brickId: string): OwningTower | null {
    const { towers } = useWorkspaceStore.getState();
    for (const tower of Object.values(towers)) {
        const nodes = listNodes(tower.root);
        if (nodes.some((node) => node.model.id === brickId)) return { tower, nodes };
    }
    return null;
}

/**
 * Resolves the dragged tower's drop into a join and performs it, or reconciles the tower's position
 * when nothing valid is in range. Dispatches by root kind: a statement root snaps its open sequence
 * ends against the statement collision space; a value/expression root plugs its `output` into an
 * empty argument slot. On a match the node graph is spliced and the dragged tower absorbed into the
 * host (which re-runs its layout); otherwise the dragged tower simply stays where it was dropped.
 *
 * @returns true when a join happened (the dragged tower was absorbed), false otherwise.
 */
function resolveDrop(tower: TowerState, finalCoords: Record<string, Point>): boolean {
    const workspace = useWorkspaceStore.getState();
    const root = tower.root;

    if (root.kind === 'statement') {
        const probes = collectStatementProbes(root, finalCoords);
        const plan = resolveStatementDrop({
            draggedRoot: root,
            probes,
            draggedTowerId: tower.id,
            space: workspace.statementCollisionSpace,
            connectors: workspace.statementConnectors,
            towers: workspace.towers,
        });
        if (!plan) return false;

        joinTowers(plan);
        workspace.absorbTower(tower.id, plan.targetTowerId);
        return true;
    }

    if (root.kind === 'value' || root.kind === 'expression') {
        const topLeft = finalCoords[root.model.id];
        const output = root.model.getConnectorCoords().output;
        if (!topLeft || !output) return false;

        const probeCenter = { x: topLeft.x + output.x, y: topLeft.y + output.y };
        const target = resolveArgumentDrop({
            probeCenter,
            draggedTowerId: tower.id,
            space: workspace.argumentCollisionSpace,
            connectors: workspace.argumentConnectors,
            towers: workspace.towers,
        });
        if (!target) return false;

        joinArg({ draggedRoot: root, target: target.node, slotIndex: target.slotIndex });
        workspace.absorbTower(tower.id, target.towerId);
        return true;
    }

    return false;
}

/**
 * Attaches interact.js drag events to a brick's DOM element. A tower moves as a unit: grabbing any
 * brick drags the WHOLE tower, translating every node by writing transforms straight to the DOM so
 * no brick re-renders mid-drag; the layout store is reconciled once on release. On release the
 * tower's open ends are probed against the live collision spaces for a valid mate (statement
 * sequence join or argument-slot plug).
 *
 * @param id - The unique identifier of the grabbed brick.
 * @param ref - The DOM ref of the brick's wrapper element.
 */
export function useBrickMove(id: string, ref: RefObject<HTMLElement | null>) {
    const dragStateRef = useRef<DragState | null>(null);
    const deltaRef = useRef<Point>({ x: 0, y: 0 });
    const isMounted = useBrickLayoutStore((state) => state.mounted[id]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const interactable = interact(el).draggable({
            listeners: {
                start(_event: DragEvent) {
                    deltaRef.current = { x: 0, y: 0 };

                    const owning = findTower(id);
                    if (!owning) {
                        dragStateRef.current = null;
                        return;
                    }
                    const { tower, nodes } = owning;

                    // Index every positioned brick element on the canvas by its `data-id`, in one
                    // static-selector query (no per-node lookup, no id escaping).
                    const canvas = el.offsetParent as HTMLElement | null;
                    const elById = new Map<string, HTMLElement>();
                    canvas?.querySelectorAll<HTMLElement>('[data-id]').forEach((brickEl) => {
                        const dataId = brickEl.dataset.id;
                        if (dataId) elById.set(dataId, brickEl);
                    });

                    // Snapshot each node's start position AND its DOM element so `move` can translate
                    // the whole tower via direct DOM writes — no per-frame store write, no re-render.
                    const { coords } = useBrickLayoutStore.getState();
                    const dragNodes: Record<string, DraggedNode> = {};
                    for (const node of nodes) {
                        const nodeId = node.model.id;
                        const current = coords[nodeId];
                        const nodeEl = elById.get(nodeId) ?? null;
                        if (current && nodeEl) {
                            dragNodes[nodeId] = {
                                el: nodeEl,
                                start: { x: current.x, y: current.y },
                            };
                        }
                    }

                    dragStateRef.current = {
                        towerId: tower.id,
                        towerStart: { x: tower.position.x, y: tower.position.y },
                        nodes: dragNodes,
                    };
                },
                move(event: DragEvent) {
                    deltaRef.current.x += event.dx;
                    deltaRef.current.y += event.dy;

                    const drag = dragStateRef.current;
                    if (!drag) {
                        // Fallback: no resolved tower — translate only the grabbed brick via the store.
                        const { coords, setCoords } = useBrickLayoutStore.getState();
                        const current = coords[id];
                        if (current) {
                            setCoords(id, { x: current.x + event.dx, y: current.y + event.dy });
                        }
                        return;
                    }

                    // Translate every node of the tower by writing its transform straight to the DOM.
                    const { x: dx, y: dy } = deltaRef.current;
                    for (const { el: nodeEl, start } of Object.values(drag.nodes)) {
                        nodeEl.style.transform = `translate(${start.x + dx}px, ${start.y + dy}px)`;
                    }
                },
                end(_event: DragEvent) {
                    const drag = dragStateRef.current;
                    dragStateRef.current = null;
                    if (!drag) return;

                    const { towers, updateTowerPosition } = useWorkspaceStore.getState();
                    const tower = towers[drag.towerId];
                    if (!tower) return;

                    const { x: dx, y: dy } = deltaRef.current;

                    // The move handler wrote only to the DOM, so the store still holds each brick's
                    // START position. Compute the dropped positions and commit them ONCE so the
                    // post-drop render reads the dropped coords and the snap probe measures the real
                    // drop.
                    const finalCoords: Record<string, Point> = {};
                    for (const [nodeId, node] of Object.entries(drag.nodes)) {
                        finalCoords[nodeId] = { x: node.start.x + dx, y: node.start.y + dy };
                    }
                    useBrickLayoutStore.getState().setCoords(finalCoords);

                    const joined = resolveDrop(tower, finalCoords);

                    // No valid mate: the tower stays free. Reconcile its origin with where it was
                    // dropped so `position` and the per-brick coords stay consistent.
                    if (!joined) {
                        updateTowerPosition(drag.towerId, {
                            x: drag.towerStart.x + dx,
                            y: drag.towerStart.y + dy,
                        });
                    }
                },
            },
        });

        return () => {
            interactable.unset();
        };
    }, [id, ref, isMounted]);
}
