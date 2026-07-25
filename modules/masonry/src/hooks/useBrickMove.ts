import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import { useBrickLayoutStore } from '@/stores/brick';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { joinArg, resolveArgumentConnection } from '@/utils/argument-connect';
import type { TowerNode } from '@/@types/tower.types';

/**
 * Attempts to join the just-dropped tower to a settled tower through an argument slot, in either
 * direction. The tower that owns the slot survives the merge.
 *
 * @param towerId - The ID of the tower that was just dropped.
 * @returns Whether a join happened, in which case one of the two towers no longer exists.
 */
function tryConnectArgument(towerId: string): boolean {
    const store = useWorkspaceStore.getState();

    const connection = resolveArgumentConnection({
        draggedTowerId: towerId,
        space: store.argumentCollisionSpace,
        connectors: store.argumentConnectors,
        towers: store.towers,
    });
    if (!connection) return false;

    joinArg(connection);
    store.absorbArgumentTower(connection.absorbedTowerId, connection.hostTowerId);

    return true;
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

                    const newX = state.towerPosition.x + dragPosRef.current.x;
                    const newY = state.towerPosition.y + dragPosRef.current.y;

                    useWorkspaceStore
                        .getState()
                        .updateTowerPosition(state.towerId, { x: newX, y: newY });
                },
                end(_event: DragEvent) {
                    const state = dragStateRef.current;
                    if (!state) return;

                    // A successful argument join merges two towers into one, and the host's
                    // re-layout re-syncs both connector spaces for the whole merged graph.
                    if (!tryConnectArgument(state.towerId)) {
                        const rootNode = useWorkspaceStore.getState().towers[state.towerId]?.root;
                        if (rootNode) {
                            queueMicrotask(() => {
                                useWorkspaceStore
                                    .getState()
                                    .syncStatementConnectors(state.towerId, rootNode);
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
            }
        };
    }, [id, ref, isMounted]);
}
