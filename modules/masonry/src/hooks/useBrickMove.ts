import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import { useBrickLayoutStore } from '@/stores/brick';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { joinArg, resolveArgumentConnection } from '@/utils/argument-connect';
import { resolveCandidateConnection } from '@/utils/snap-preview-calculator';
import { joinStatement, resolveStatementConnection } from '@/utils/statement-connect';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import type { TowerNode } from '@/@types/tower.types';
import { listNodes } from '@/utils/tower-traversal';

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
export function tryConnect(towerId: string): boolean {
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
        joinArg(argument);
        store.absorbTower(argument.absorbedTowerId, argument.hostTowerId);
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
 * @param id - The unique identifier of the target brick.
 * @param ref - The DOM ref of the brick's wrapper element.
 */
export function useBrickMove(id: string, ref: RefObject<HTMLElement | null>) {
    const dragPosRef = useRef({ x: 0, y: 0 });
    const dragStateRef = useRef<{
        node: TowerNode;
        towerId: string;
        towerPosition: { x: number; y: number };
    } | null>(null);
    const isMounted = useBrickLayoutStore((state) => state.mounted[id]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const interactable = interact(el).draggable({
            listeners: {
                start(_event: DragEvent) {
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

                    if (isChild) {
                        const absPos = current
                            ? { x: current.x, y: current.y }
                            : { x: tower.position.x, y: tower.position.y };

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

                    const candidate = resolveCandidateConnection(
                        state.towerId,
                        useWorkspaceStore.getState(),
                    );
                    if (candidate) {
                        useConnectionPreviewStore
                            .getState()
                            .setPreviewTarget(
                                candidate.target,
                                candidate.isValid,
                                candidate.snapPosition,
                            );
                    } else {
                        useConnectionPreviewStore.getState().clearPreviewTarget();
                    }
                },
                end(_event: DragEvent) {
                    const state = dragStateRef.current;
                    if (!state) return;

                    useConnectionPreviewStore.getState().clearPreviewTarget();
                    useConnectionPreviewStore.getState().clearDisconnectShadow();

                    // A successful join merges two towers into one, and the host's re-layout re-syncs
                    // both connector spaces for the whole merged graph. A plain move only runs the
                    // layout's position fast-path, which never touches `positioned` and so never
                    // triggers the Workspace's sync — hence the refresh here.
                    if (!tryConnect(state.towerId)) {
                        const rootNode = useWorkspaceStore.getState().towers[state.towerId]?.root;
                        if (rootNode) {
                            queueMicrotask(() => {
                                const store = useWorkspaceStore.getState();
                                store.syncStatementConnectors(state.towerId, rootNode);
                                store.syncArgumentConnectors(state.towerId, rootNode);
                            });
                        }
                    }

                    dragStateRef.current = null;
                },
            },
        });

        return () => {
            // Only unset if not currently dragging, to allow the drag to continue
            // even if this specific brick unmounts from its old tower and remounts in the new one.
            if (!dragStateRef.current) {
                interactable.unset();
                useConnectionPreviewStore.getState().clearPreviewTarget();
            }
        };
    }, [id, ref, isMounted]);
}
