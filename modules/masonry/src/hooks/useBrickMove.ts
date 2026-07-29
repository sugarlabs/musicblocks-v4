import type { DragEvent } from '@interactjs/types';
import interact from 'interactjs';
import { RefObject, useEffect, useRef } from 'react';

import { useBrickLayoutStore } from '@/stores/brick';
import { useTrashStore } from '@/stores/trash';
import { findNodeAndTower, useWorkspaceStore } from '@/stores/workspace';
import { joinArg, resolveArgumentConnection } from '@/utils/argument-connect';
import { isPointInsideBounds } from '@/utils/geometry';
import { joinStatement, resolveStatementConnection } from '@/utils/statement-connect';
import { discardTower } from '@/utils/towerDiscard';
import type { TowerNode } from '@/@types/tower.types';

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
function tryConnect(towerId: string): boolean {
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

        return true;
    }

    if (argument !== null) {
        joinArg(argument);
        store.absorbTower(argument.absorbedTowerId, argument.hostTowerId);

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

                    // interact.js has pointer capture for the whole drag, so the Trash can never
                    // see a hover of its own — the pointer is tested against its published rect
                    // here instead. `setHovered` ignores no-op writes, so running this every frame
                    // only wakes the Trash on an actual crossing.
                    const { bounds, setHovered } = useTrashStore.getState();
                    setHovered(isPointInsideBounds({ x: event.clientX, y: event.clientY }, bounds));
                },
                end(event: DragEvent) {
                    // Before the early return: a drag that ends without a tracked state must still
                    // leave the Trash unhighlighted.
                    useTrashStore.getState().setHovered(false);

                    const state = dragStateRef.current;
                    if (!state) return;

                    // Cleared up front so no exit path can leave it set: the effect's cleanup reads
                    // it to decide whether the drag is still in flight, and a stale value would keep
                    // the interactable alive past unmount.
                    dragStateRef.current = null;

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
