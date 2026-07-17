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
import { joinTowers, type DraggedKind, type JoinParams } from '@/utils/tower-join';
import { listNodes } from '@/utils/tower-traversal';

/** Per-drag bookkeeping, captured at `start` and consumed through `move` and `end`. */
interface DragState {
    /** Id of the tower the grabbed brick belongs to. */
    towerId: string;
    /** The tower's origin at drag start, used to reconcile its final position on drop. */
    towerStart: Point;
    /** Each dragged node's top-left position at drag start, keyed by brick id. */
    nodeStarts: Record<string, Point>;
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

/** A validated snap resolved to everything the drop needs: the join to perform and the merge. */
interface JoinPlan {
    /** Fully validated parameters for {@link joinTowers}. */
    params: JoinParams;
    /** Id of the stationary tower that absorbs the dragged one after the join. */
    targetTowerId: string;
}

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

    // A dragged `nestedNext` is never an approved mate; narrow to a 'prev' | 'next' with no cast so
    // `joinTowers` only ever receives a `DraggedKind`.
    if (snap.draggedKind === 'nestedNext') return null;
    const draggedKind: DraggedKind = snap.draggedKind;

    const draggedRoot = tower.root;
    if (draggedRoot.kind !== 'statement') return null;

    const targetTower = towers[snap.targetTowerId];
    if (!targetTower) return null;

    // Resolve the matched target node (by id) within the target tower's graph.
    const targetNode = listNodes(targetTower.root).find(
        (node) => node.model.id === snap.targetNodeId,
    );
    if (!targetNode || targetNode.kind !== 'statement') return null;

    return {
        params: { draggedRoot, target: targetNode, draggedKind, targetKind: snap.targetKind },
        targetTowerId: snap.targetTowerId,
    };
}

/**
 * Attaches interact.js drag events to a brick's DOM element. A tower moves as a unit: grabbing any
 * brick drags the WHOLE tower, translating every node together via a batched layout-store update.
 * On release the tower's two open ends are probed against the shared snap engine for a valid mate.
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

                    // Snapshot the start position of every node in the tower so `move` can
                    // translate them all by the accumulated delta. Reuse the node list `findTower`
                    // already computed rather than walking the graph again.
                    const { coords } = useBrickLayoutStore.getState();
                    const nodeStarts: Record<string, Point> = {};
                    for (const node of nodes) {
                        const current = coords[node.model.id];
                        if (current) {
                            nodeStarts[node.model.id] = { x: current.x, y: current.y };
                        }
                    }

                    // Size the shared snap space to the canvas (the brick's positioned ancestor)
                    // and rebuild its targets from every tower EXCEPT this one.
                    const canvas = el.offsetParent as HTMLElement | null;
                    const width = canvas?.clientWidth ?? el.clientWidth;
                    const height = canvas?.clientHeight ?? el.clientHeight;
                    const engine = getSnapEngine(width, height);
                    refreshSnapTargets(tower.id);

                    dragStateRef.current = {
                        towerId: tower.id,
                        towerStart: { x: tower.position.x, y: tower.position.y },
                        nodeStarts,
                        engine,
                    };
                },
                move(event: DragEvent) {
                    deltaRef.current.x += event.dx;
                    deltaRef.current.y += event.dy;

                    const drag = dragStateRef.current;
                    const { coords, setCoords } = useBrickLayoutStore.getState();

                    if (!drag) {
                        // Fallback: no resolved tower — translate only the grabbed brick.
                        const current = coords[id];
                        if (current) {
                            setCoords(id, {
                                x: current.x + event.dx,
                                y: current.y + event.dy,
                            });
                        }
                        return;
                    }

                    // Translate every node of the tower by the accumulated delta in one batch.
                    const batch: Record<string, Point> = {};
                    for (const [nodeId, start] of Object.entries(drag.nodeStarts)) {
                        batch[nodeId] = {
                            x: start.x + deltaRef.current.x,
                            y: start.y + deltaRef.current.y,
                        };
                    }
                    setCoords(batch);
                },
                end(_event: DragEvent) {
                    const drag = dragStateRef.current;
                    dragStateRef.current = null;
                    if (!drag) return;

                    const { towers, updateTowerPosition } = useWorkspaceStore.getState();
                    const tower = towers[drag.towerId];
                    if (!tower) return;

                    const finalPosition: Point = {
                        x: drag.towerStart.x + deltaRef.current.x,
                        y: drag.towerStart.y + deltaRef.current.y,
                    };

                    // Resolve the drop into a validated join plan (probe → findSnap → resolve target
                    // → validate) in one step, so there is a single fallback path.
                    const { coords } = useBrickLayoutStore.getState();
                    const plan = resolveSnap(tower, coords, drag.engine, towers);

                    if (plan === null) {
                        // No valid mate: the tower stays free. Reconcile its origin with where it
                        // was dropped so `position` and the per-brick coords stay consistent.
                        updateTowerPosition(drag.towerId, finalPosition);
                        return;
                    }

                    // A valid mate was found: mutate the node pointers in place, then drop the
                    // absorbed tower and bump the target's layoutVersion so useTowerLayout re-runs
                    // and positions everything flush from the target origin (snap-align falls out
                    // of the re-layout).
                    joinTowers(plan.params);
                    useWorkspaceStore.getState().absorbTower(drag.towerId, plan.targetTowerId);
                },
            },
        });

        return () => {
            interactable.unset();
        };
    }, [id, ref, isMounted]);
}
