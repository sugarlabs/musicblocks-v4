import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import { useDragClickSuppression } from '@/hooks/useDragClickSuppression';
import { useActionMenuStore } from '@/stores/actionMenu';
import { useBrickLayoutStore } from '@/stores/brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useTrashStore } from '@/stores/trash';
import { useWorkspaceViewportStore } from '@/stores/viewport';
import {
    calculateExtractedTowerPosition,
    findNodeAndTower,
    useWorkspaceStore,
} from '@/stores/workspace';
import { joinArg, resolveArgumentConnection, type ArgumentParentNode } from '@/utils/argument-connect';
import { FOLD_TOGGLE_SELECTOR } from '@/utils/constants';
import { edgePanStep, isPointInsideBounds } from '@/utils/geometry';
import { resolveCandidateConnection } from '@/utils/snap-preview-calculator';
import { joinStatement, resolveStatementConnection } from '@/utils/statement-connect';
import { discardTower } from '@/utils/towerDiscard';
import type { Bounds, Point } from '@/@types/common.types';
import type { TowerNode } from '@/@types/tower.types';
import { findNode, listNodes, measureTowerExtent, traverseTopDown } from '@/utils/tower-traversal';

/**
 * Triggers a CSS keyframe animation on a specific brick by temporarily removing
 * and re-adding the animation class, forcing a DOM reflow in between.
 * This is used to create visual "pulses" when bricks connect or disconnect.
 */
export function triggerBrickAnimation(brickId: string, animationClass: string) {
    const el = document.querySelector(`[data-brick-id="${brickId}"]`);
    if (el) {
        el.classList.remove(animationClass);
        // Force reflow to restart animation
        void (el as HTMLElement).offsetWidth;
        el.classList.add(animationClass);
        setTimeout(() => el.classList.remove(animationClass), 400);
    }
}

/** Converts a DOMRect to the `Bounds` shape the geometry helpers take. */
function rectBounds(rect: DOMRect): Bounds {
    return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

/**
 * Attempts to join the just-dropped tower to a settled tower, through either an argument slot or a
 * statement notch, in either direction. The tower that stays rooted survives the merge.
 *
 * Both kinds are resolved before either is applied: a statement brick has argument slots as well as
 * notches, so one drop can be in range of both, and the closer connector is the intended one.
 *
 * @param towerId - The ID of the tower that was just dropped.
 * @returns Whether a join happened, in which case one of the two towers no longer exists.
 */
export function tryConnect(
    towerId: string,
    originPosition?: Point,
    originSlot?: { towerId: string; parentId: string; slotIndex: number } | null,
): boolean {
    const store = useWorkspaceStore.getState();

    const argument = resolveArgumentConnection({
        draggedTowerId: towerId,
        space: store.argumentCollisionSpace,
        connectors: store.argumentConnectors,
        towers: store.towers,
    });

    const statement = resolveStatementConnection({
        draggedTowerId: towerId,
        space: store.statementCollisionSpace,
        connectors: store.statementConnectors,
        towers: store.towers,
    });

    if (statement !== null && (argument === null || statement.distance < argument.distance)) {
        joinStatement(statement);
        store.absorbTower(statement.absorbedTowerId, statement.hostTowerId);
        triggerBrickAnimation(towerId, 'brick-snap-pulse');

        return true;
    }

    if (argument !== null) {
        let isSameTreeSwap = false;

        if (argument.residentNode) {
            const treeTowerId =
                originSlot?.towerId === argument.hostTowerId
                    ? argument.hostTowerId
                    : originSlot?.towerId === argument.absorbedTowerId
                      ? argument.absorbedTowerId
                      : null;

            isSameTreeSwap = treeTowerId !== null && typeof originSlot?.slotIndex === 'number';

            const hostTower = treeTowerId ? store.towers[treeTowerId] : store.towers[argument.hostTowerId];
            if (hostTower) {
                const originParent =
                    isSameTreeSwap && originSlot
                        ? (findNode(hostTower.root, originSlot.parentId) as ArgumentParentNode | null)
                        : null;

                const residentDescendantIds = new Set(
                    listNodes(argument.residentNode).map((n) => n.model.id),
                );
                const isAcyclic = originParent
                    ? !residentDescendantIds.has(originParent.model.id)
                    : false;

                if (
                    isSameTreeSwap &&
                    originSlot &&
                    originParent &&
                    isAcyclic &&
                    (originParent.kind === 'expression' || originParent.kind === 'statement') &&
                    originParent.args[originSlot.slotIndex] === null
                ) {
                    originParent.args[originSlot.slotIndex] = argument.residentNode;
                    argument.residentNode.parent = originParent;

                    // If the connection resolved in a way that made the dragged tower the host,
                    // swap the IDs so the original tree survives as the host.
                    if (argument.absorbedTowerId === treeTowerId) {
                        const tempHost = argument.hostTowerId;
                        argument.hostTowerId = argument.absorbedTowerId;
                        argument.absorbedTowerId = tempHost;
                    }
                } else {
                    const targetPosition =
                        argument.hostTowerId === towerId
                            ? store.towers[argument.absorbedTowerId]?.position
                            : originPosition;
                    const coords = useBrickLayoutStore.getState().coords;
                    const { [argument.absorbedTowerId]: _absorbed, ...remainingTowers } =
                        store.towers;

                    let isColliding = false;
                    if (targetPosition) {
                        const residentDims = measureTowerExtent(
                            { root: argument.residentNode, position: targetPosition },
                            coords,
                        );
                        const residentW = Math.max(residentDims.w, 40);
                        const residentH = Math.max(residentDims.h, 30);

                        isColliding = Object.values(remainingTowers).some((t) => {
                            if (t.id === argument.hostTowerId && isSameTreeSwap) return false;
                            const ext = measureTowerExtent(t, coords);
                            return (
                                targetPosition.x < t.position.x + ext.w + 10 &&
                                targetPosition.x + residentW + 10 > t.position.x &&
                                targetPosition.y < t.position.y + ext.h + 10 &&
                                targetPosition.y + residentH + 10 > t.position.y
                            );
                        });
                    }

                    const dropPos =
                        targetPosition && !isColliding
                            ? targetPosition
                            : calculateExtractedTowerPosition(
                                  hostTower,
                                  argument.residentNode.model.id,
                                  undefined,
                                  undefined,
                                  remainingTowers,
                              );
                    const newTowerId = store.detachBrickToNewTower(
                        argument.hostTowerId,
                        argument.residentNode.model.id,
                        dropPos,
                    );

                    if (newTowerId) {
                        const latestStore = useWorkspaceStore.getState();
                        const newTower = latestStore.towers[newTowerId];
                        if (newTower) {
                            traverseTopDown(newTower.root, newTower.position);
                            latestStore.syncStatementConnectors(newTowerId, newTower.root);
                            latestStore.syncArgumentConnectors(newTowerId, newTower.root);
                        }
                    }
                }
            }
        }

        joinArg(argument);
        store.absorbTower(argument.absorbedTowerId, argument.hostTowerId);

        if (isSameTreeSwap) {
            const latestStore = useWorkspaceStore.getState();
            const updatedHost = latestStore.towers[argument.hostTowerId];
            if (updatedHost) {
                traverseTopDown(updatedHost.root, updatedHost.position);
                latestStore.syncStatementConnectors(argument.hostTowerId, updatedHost.root);
                latestStore.syncArgumentConnectors(argument.hostTowerId, updatedHost.root);
            }
        }

        triggerBrickAnimation(towerId, 'brick-snap-pulse');

        return true;
    }

    return false;
}

/**
 * Attaches interact.js drag events to a brick's DOM element.
 * During a drag, it collects the position delta and updates the target
 * brick's coordinates in the brick layout store, visually translating it.
 *
 * Holding the pointer near a canvas edge pans the canvas, and the dragged tower is moved back by
 * the same amount so the brick stays under the pointer.
 *
 * @param id - The unique identifier of the target brick.
 * @param ref - The DOM ref of the brick's wrapper element.
 * @param canvasRef - The canvas whose edges start the pan. Without it the brick never auto-pans.
 * @returns A predicate that is true while a click trailing the brick's own drag should be ignored.
 */
export function useBrickMove(
    id: string,
    ref: RefObject<HTMLElement | null>,
    canvasRef?: RefObject<HTMLElement | null>,
) {
    const dragPosRef = useRef({ x: 0, y: 0 });
    const autoPanRef = useRef<{ frame: number | null; step: Point }>({
        frame: null,
        step: { x: 0, y: 0 },
    });
    const dragStateRef = useRef<{
        node: TowerNode;
        towerId: string;
        towerPosition: { x: number; y: number };
        originPosition: { x: number; y: number };
        originSlot?: {
            towerId: string;
            parentId: string;
            slotIndex: number;
        } | null;
    } | null>(null);
    // Suppresses the click interact.js leaves trailing this brick's own drag. interact.js only
    // starts a drag once the pointer has moved, so `end` always marks a real drag.
    const { markDragEnd, shouldSuppressClick } = useDragClickSuppression();
    const isMounted = useBrickLayoutStore((state) => state.mounted[id]);
    const areBricksHidden = useWorkspaceStore((state) => state.areBricksHidden);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        /** Cancels the pending pan frame, if there is one, and clears the step. */
        const stopAutoPan = () => {
            if (autoPanRef.current.frame !== null) {
                cancelAnimationFrame(autoPanRef.current.frame);
                autoPanRef.current.frame = null;
            }

            autoPanRef.current.step = { x: 0, y: 0 };
        };

        /** Points the snap preview at whatever the dragged tower would join if dropped now. */
        const updatePreview = (towerId: string) => {
            const candidate = resolveCandidateConnection(towerId, useWorkspaceStore.getState());
            if (candidate) {
                useConnectionPreviewStore
                    .getState()
                    .setPreviewTarget(candidate.target, candidate.isValid, candidate.snapPosition);
            } else {
                useConnectionPreviewStore.getState().clearPreviewTarget();
            }
        };

        /** Pans one step and moves the dragged tower back by the same amount. */
        const stepAutoPan = () => {
            const state = dragStateRef.current;
            const { step } = autoPanRef.current;

            if (!state || (step.x === 0 && step.y === 0)) {
                stopAutoPan();

                return;
            }

            // The store clamps the offset at the origin, so use what it actually moved.
            const before = useWorkspaceViewportStore.getState().offset;
            useWorkspaceViewportStore.getState().panBy(step);
            const after = useWorkspaceViewportStore.getState().offset;

            const applied = { x: after.x - before.x, y: after.y - before.y };

            // Stuck at the clamp, so stop. The next `move` starts the loop again.
            if (applied.x === 0 && applied.y === 0) {
                stopAutoPan();

                return;
            }

            state.towerPosition.x -= applied.x;
            state.towerPosition.y -= applied.y;

            useWorkspaceStore.getState().updateTowerPosition(state.towerId, {
                x: state.towerPosition.x + dragPosRef.current.x,
                y: state.towerPosition.y + dragPosRef.current.y,
            });

            // The pointer hasn't moved, so no `move` will update the preview for the new position.
            updatePreview(state.towerId);

            autoPanRef.current.frame = requestAnimationFrame(stepAutoPan);
        };

        /** Starts the pan loop, unless it is already running. */
        const startAutoPan = () => {
            if (autoPanRef.current.frame === null) {
                autoPanRef.current.frame = requestAnimationFrame(stepAutoPan);
            }
        };

        const interactable = interact(el).draggable({
            // While bricks are hidden, nothing invisible should be grabbable — disabling the
            // interaction here means `start`/`move`/`end` never fire at all, which is also what
            // keeps the Trash hover and snap preview quiet without touching their stores directly.
            enabled: !areBricksHidden,
            // The fold chevron is overlaid on the brick, so every press on it is also a press on
            // the brick. Without this, folding a cavity would tear the brick out of its tower on
            // the way: the pointer moves a few pixels between press and release, which is a drag as
            // far as interact.js is concerned. The chevron stops its own pointerdown too, but only
            // this covers the press that has already become a drag.
            ignoreFrom: FOLD_TOGGLE_SELECTOR,
            listeners: {
                start(_event: DragEvent) {
                    // The pointerdown behind this drag has closed the menu already; kept for the
                    // drag that starts on the menu itself, and ahead of the early return below.
                    useActionMenuStore.getState().close();

                    const { coords } = useBrickLayoutStore.getState();
                    const current = coords[id];

                    const found = findNodeAndTower(id);
                    if (!found) return;

                    const { node, tower } = found;
                    // If the dragged brick is not the root of its tower, it's connected to a parent.
                    // We must detach it and move it to its own new tower before starting the drag.
                    const isChild = node !== tower.root;
                    let targetTowerId = tower.id;
                    let targetPosition = { x: tower.position.x, y: tower.position.y };

                    const absPos = current
                        ? { x: current.x, y: current.y }
                        : { x: tower.position.x, y: tower.position.y };
                    const originPosition = { ...absPos };
                    let originSlot: { towerId: string; parentId: string; slotIndex: number } | null =
                        null;

                    if (isChild) {
                        // Find parent to leave a disconnect shadow
                        let shadowSocket: 'next' | 'nestedNext' | 'output' | number | null = null;
                        let shadowParentId: string | null = null;

                        const nodes = listNodes(tower.root);
                        for (const n of nodes) {
                            if (n.kind === 'statement' && n.next?.model.id === id) {
                                shadowParentId = n.model.id;
                                shadowSocket = 'next';
                                break;
                            }
                            if (n.kind === 'statement' && n.nestedNext?.model.id === id) {
                                shadowParentId = n.model.id;
                                shadowSocket = 'nestedNext';
                                break;
                            }
                            if ('args' in n) {
                                const idx = n.args.findIndex((a) => a?.model.id === id);
                                if (idx !== -1) {
                                    shadowParentId = n.model.id;
                                    shadowSocket = idx;
                                    break;
                                }
                            }
                        }

                        if (typeof shadowSocket === 'number' && shadowParentId) {
                            originSlot = {
                                towerId: tower.id,
                                parentId: shadowParentId,
                                slotIndex: shadowSocket,
                            };
                        }

                        if (shadowParentId && shadowSocket !== null) {
                            useConnectionPreviewStore.getState().setDisconnectShadow({
                                hostTowerId: tower.id,
                                hostBrickId: shadowParentId,
                                socket: shadowSocket,
                            });
                        }

                        // Pre-emptively set dragStateRef so that if detachBrickToNewTower triggers a synchronous React
                        // unmount/remount, the cleanup function knows a drag is active and won't clear the shadow.
                        dragStateRef.current = {
                            node,
                            towerId: '', // Will be updated immediately below
                            towerPosition: { x: 0, y: 0 },
                            originPosition,
                            originSlot,
                        };

                        // Detach from the parent and create a new tower for this subtree
                        const newTowerId = useWorkspaceStore
                            .getState()
                            .detachBrickToNewTower(tower.id, id, absPos);

                        if (newTowerId) {
                            targetTowerId = newTowerId;
                            targetPosition = absPos;
                        }
                    }

                    dragPosRef.current = { x: 0, y: 0 };
                    dragStateRef.current = {
                        node,
                        towerId: targetTowerId,
                        towerPosition: targetPosition,
                        originPosition,
                        originSlot,
                    };
                },
                move(event: DragEvent) {
                    dragPosRef.current.x += event.dx;
                    dragPosRef.current.y += event.dy;

                    const state = dragStateRef.current;
                    if (!state) return;

                    const nextX = state.towerPosition.x + dragPosRef.current.x;
                    const nextY = state.towerPosition.y + dragPosRef.current.y;

                    useWorkspaceStore
                        .getState()
                        .updateTowerPosition(state.towerId, { x: nextX, y: nextY });

                    // interact.js has pointer capture for the whole drag, so the Trash can never
                    // see a hover of its own — the pointer is tested against its published rect
                    // here instead. `setHovered` ignores no-op writes, so running this every frame
                    // only wakes the Trash on an actual crossing.
                    const { bounds, setHovered } = useTrashStore.getState();
                    const overTrash = isPointInsideBounds(
                        { x: event.clientX, y: event.clientY },
                        bounds,
                    );
                    setHovered(overTrash);

                    // The Trash sits inside the bottom-right band, so don't pan while over it.
                    const canvasRect = canvasRef?.current?.getBoundingClientRect() ?? null;

                    autoPanRef.current.step = overTrash
                        ? { x: 0, y: 0 }
                        : edgePanStep(
                              { x: event.clientX, y: event.clientY },
                              canvasRect && rectBounds(canvasRect),
                          );

                    const { step } = autoPanRef.current;
                    if (step.x === 0 && step.y === 0) {
                        stopAutoPan();
                    } else {
                        startAutoPan();
                    }

                    // A drop on the Trash discards, so a snap preview here would promise a
                    // connection `end` will never make.
                    if (overTrash) {
                        useConnectionPreviewStore.getState().clearPreviewTarget();

                        return;
                    }

                    updatePreview(state.towerId);
                },
                end(event: DragEvent) {
                    // Recorded before the early returns so the trailing click is suppressed even
                    // when the drop was untracked or discarded.
                    markDragEnd();

                    // Before the early return: a drag that ends without a tracked state must still
                    // leave the Trash unhighlighted.
                    useTrashStore.getState().setHovered(false);
                    stopAutoPan();

                    const state = dragStateRef.current;
                    if (!state) return;

                    // Cleared up front so no exit path can leave it set: the effect's cleanup reads
                    // it to decide whether the drag is still in flight, and a stale value would keep
                    // the interactable alive past unmount.
                    dragStateRef.current = null;

                    // Ahead of the discard return too, so neither overlay outlives the drag that
                    // drew it.
                    useConnectionPreviewStore.getState().clearPreviewTarget();
                    useConnectionPreviewStore.getState().clearDisconnectShadow();

                    // Where the pointer came to rest decides the drop, rather than the hover flag
                    // the last `move` frame happened to leave behind. Discarding the tower also
                    // rules out a connection: returning here skips the join attempt, and skips the
                    // connector re-sync that would otherwise re-add the points `removeTower` just
                    // purged for a tower that no longer exists.
                    const { bounds } = useTrashStore.getState();
                    if (isPointInsideBounds({ x: event.clientX, y: event.clientY }, bounds)) {
                        discardTower(state.towerId);

                        return;
                    }

                    // A successful join merges two towers into one, and the host's re-layout re-syncs
                    // both connector spaces for the whole merged graph. A plain move only runs the
                    // layout's position fast-path, which never touches `positioned` and so never
                    // triggers the Workspace's sync — hence the refresh here.
                    if (!tryConnect(state.towerId, state.originPosition, state.originSlot)) {
                        const rootNode = useWorkspaceStore.getState().towers[state.towerId]?.root;
                        if (rootNode) {
                            queueMicrotask(() => {
                                const store = useWorkspaceStore.getState();
                                store.syncStatementConnectors(state.towerId, rootNode);
                                store.syncArgumentConnectors(state.towerId, rootNode);
                            });
                        }
                    }

                    // Commit history after the drag/drop is complete (and connections have been made)
                    import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
                        useWorkspaceHistoryStore.getState().commit();
                    });
                },
            },
        });

        return () => {
            // Always stop the pan loop. A drag that is still going restarts it on the next `move`.
            stopAutoPan();

            // Only unset if not currently dragging, to allow the drag to continue
            // even if this specific brick unmounts from its old tower and remounts in the new one.
            if (!dragStateRef.current) {
                interactable.unset();
                useConnectionPreviewStore.getState().clearPreviewTarget();
            }
        };
    }, [id, ref, canvasRef, isMounted, areBricksHidden, markDragEnd]);

    // Stable, so `TowerBrickView`'s click handler can depend on it without re-subscribing.
    return shouldSuppressClick;
}
