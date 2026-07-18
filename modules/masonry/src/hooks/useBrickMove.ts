import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import type { Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';

import { useBrickLayoutStore } from '@/stores/brick';
import { getSnapEngine, refreshSnapTargets } from '@/stores/snap';
import { useWorkspaceStore } from '@/stores/workspace';
import { collectProbeConnectors, ORIGIN } from '@/utils/connectors';
import type { SnapCandidate, SnapEngine } from '@/utils/snap';
import {
    joinArg,
    joinTowers,
    type ArgJoinParams,
    type DraggedKind,
    type JoinParams,
} from '@/utils/tower-join';
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
    /** The shared snap engine — already sized to the canvas and targeted at every other tower. */
    engine: SnapEngine;
}

/** A resolved owning tower together with the node list already computed while locating the brick. */
interface OwningTower {
    /** The tower whose node graph contains the searched-for brick. */
    tower: TowerState;
    /** Every node in that tower — reused so the caller need not walk the graph again. */
    nodes: TowerNode[];
}

/**
 * Finds the workspace tower whose node graph contains the brick with the given id, returning both
 * the tower AND the node list computed while searching so the caller can reuse it (rather than
 * walking the graph a second time).
 */
function findTower(brickId: string): OwningTower | null {
    const { towers } = useWorkspaceStore.getState();
    for (const tower of Object.values(towers)) {
        const nodes = listNodes(tower.root);
        for (const node of nodes) {
            if (node.model.id === brickId) return { tower, nodes };
        }
    }
    return null;
}

/**
 * A validated snap resolved to everything the drop needs: the join to perform and the merge. A drop
 * is either a STATEMENT join (sequence snapping, spliced by {@link joinTowers}) or an ARG join
 * (argument snapping, plugged by {@link joinArg}); both then absorb the dragged tower.
 */
type JoinPlan =
    | { type: 'statement'; params: JoinParams; targetTowerId: string }
    | { type: 'arg'; params: ArgJoinParams; targetTowerId: string };

/**
 * Resolves the dragged tower's drop into a join plan, or `null` when nothing valid is in range —
 * probe the two open ends, find the nearest snap, resolve the matched target node by id, validate
 * the mating. The snap layer keeps its id-only boundary: `engine.findSnap` sees only connector
 * probes, and this function reads the store to turn the matched ids back into nodes.
 */
function resolveSnap(
    tower: TowerState,
    coords: Record<string, Point>,
    engine: SnapEngine,
    towers: Record<string, TowerState>,
): JoinPlan | null {
    // Probe the two open ends against the targets built at drag start; keep the nearest valid mate.
    const probes = collectProbeConnectors(tower.root, ORIGIN, coords, tower.id);

    let best: SnapCandidate | null = null;
    for (const probe of probes) {
        const candidate = engine.findSnap(probe);
        if (candidate && (best === null || candidate.distance < best.distance)) {
            best = candidate;
        }
    }

    if (best === null) return null;
    const snap = best;

    const targetTower = towers[snap.targetTowerId];
    if (!targetTower) return null;

    // Resolve the matched target node (by id) within the target tower's graph.
    const targetNode = listNodes(targetTower.root).find(
        (node) => node.model.id === snap.targetNodeId,
    );
    if (!targetNode) return null;

    // Argument join: a dragged `output` plugs into a target's empty `input` slot. The empty-slot and
    // kind guards are defensive — `findSnap` already filters occupied inputs and gates the mating.
    if (snap.draggedKind === 'output') {
        const draggedRoot = tower.root;
        if (draggedRoot.kind !== 'value' && draggedRoot.kind !== 'expression') return null;
        if (snap.targetKind !== 'input' || snap.target.slotIndex === undefined) return null;
        if (snap.target.occupied) return null;
        if (targetNode.kind !== 'expression' && targetNode.kind !== 'statement') return null;

        return {
            type: 'arg',
            params: { draggedRoot, target: targetNode, slotIndex: snap.target.slotIndex },
            targetTowerId: snap.targetTowerId,
        };
    }

    // Statement join: only a dragged `prev`/`next` is an approved mate (a `nestedNext` or an
    // argument-domain `input` is not); narrow to a 'prev' | 'next' with no cast so `joinTowers` only
    // ever receives a `DraggedKind`.
    if (snap.draggedKind !== 'prev' && snap.draggedKind !== 'next') return null;
    const draggedKind: DraggedKind = snap.draggedKind;

    const draggedRoot = tower.root;
    if (draggedRoot.kind !== 'statement') return null;

    if (targetNode.kind !== 'statement') return null;

    return {
        type: 'statement',
        params: { draggedRoot, target: targetNode, draggedKind, targetKind: snap.targetKind },
        targetTowerId: snap.targetTowerId,
    };
}

/**
 * Attaches interact.js drag events to a brick's DOM element. A tower moves as a unit: grabbing any
 * brick drags the WHOLE tower, translating every node by writing transforms straight to the DOM so
 * no brick re-renders mid-drag; the layout store is reconciled once on release. On release the
 * tower's two open ends are probed against the shared snap engine for a valid mate.
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
                        // No owning tower (shouldn't happen for a mounted brick) — fall back to
                        // moving just the grabbed brick in `move`.
                        dragStateRef.current = null;
                        return;
                    }
                    const { tower, nodes } = owning;

                    // Size the shared snap space to the canvas (the brick's positioned ancestor)
                    // and rebuild its targets from every tower EXCEPT this one.
                    const canvas = el.offsetParent as HTMLElement | null;
                    const width = canvas?.clientWidth ?? el.clientWidth;
                    const height = canvas?.clientHeight ?? el.clientHeight;
                    const engine = getSnapEngine(width, height);
                    refreshSnapTargets(tower.id);

                    // Index every positioned brick element on the canvas by its `data-id`, in one
                    // static-selector query (no per-node lookup, no id escaping).
                    const elById = new Map<string, HTMLElement>();
                    canvas?.querySelectorAll<HTMLElement>('[data-id]').forEach((brickEl) => {
                        const dataId = brickEl.dataset.id;
                        if (dataId) elById.set(dataId, brickEl);
                    });

                    // Snapshot each node's start position AND its DOM element, so `move` can
                    // translate the whole tower by writing transforms straight to the DOM — no
                    // per-frame store write means no brick re-renders mid-drag (mirroring the
                    // palette-ghost drag). Reuse the node list `findTower` already computed rather
                    // than walking the graph again.
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
                        engine,
                    };
                },
                move(event: DragEvent) {
                    deltaRef.current.x += event.dx;
                    deltaRef.current.y += event.dy;

                    const drag = dragStateRef.current;

                    if (!drag) {
                        // Fallback: no resolved tower — translate only the grabbed brick via the
                        // store. It's a single brick, so the re-render cost is negligible here.
                        const { coords, setCoords } = useBrickLayoutStore.getState();
                        const current = coords[id];
                        if (current) {
                            setCoords(id, {
                                x: current.x + event.dx,
                                y: current.y + event.dy,
                            });
                        }
                        return;
                    }

                    // Translate every node of the tower by writing its transform straight to the
                    // DOM. This bypasses the layout store, so no brick re-renders mid-drag; the
                    // store is reconciled once on `end`.
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
                    // START position. Compute the dropped positions and commit them ONCE — the sole
                    // re-render of the whole drag — so the post-drop render reads the dropped (not
                    // the stale start) coords, and the snap probe below measures the real drop.
                    const finalCoords: Record<string, Point> = {};
                    for (const [nodeId, node] of Object.entries(drag.nodes)) {
                        finalCoords[nodeId] = { x: node.start.x + dx, y: node.start.y + dy };
                    }
                    useBrickLayoutStore.getState().setCoords(finalCoords);

                    const finalPosition: Point = {
                        x: drag.towerStart.x + dx,
                        y: drag.towerStart.y + dy,
                    };

                    // Resolve the drop into a validated join plan (probe → findSnap → resolve target
                    // → validate) in one step, so there is a single fallback path.
                    const plan = resolveSnap(tower, finalCoords, drag.engine, towers);

                    if (plan === null) {
                        // No valid mate: the tower stays free. Reconcile its origin with where it
                        // was dropped so `position` and the per-brick coords stay consistent.
                        updateTowerPosition(drag.towerId, finalPosition);
                        return;
                    }

                    // A valid mate was found: mutate the node pointers in place, then drop the
                    // absorbed tower and bump the target's layoutVersion so useTowerLayout re-runs
                    // and positions everything flush from the target origin (snap-align falls out
                    // of the re-layout). A statement join splices the sequence; an arg join plugs
                    // the output into the target slot.
                    if (plan.type === 'statement') joinTowers(plan.params);
                    else joinArg(plan.params);
                    useWorkspaceStore.getState().absorbTower(drag.towerId, plan.targetTowerId);
                },
            },
        });

        return () => {
            interactable.unset();
        };
    }, [id, ref, isMounted]);
}
