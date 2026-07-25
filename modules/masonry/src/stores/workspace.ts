import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type { Point } from '@/@types/common.types';
import type {
    ArgumentConnectorMeta,
    StatementConnectorMeta,
    TowerState,
} from '@/@types/workspace.types';
import type { TowerNode } from '@/@types/tower.types';
import { QuadtreeCollisionSpace } from '@/utils/collision';
import { extractArgumentConnectors } from '@/utils/argument-collision';
import { extractStatementConnectors } from '@/utils/statement-collision';

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;

    /** Collision space tracking statement connection points */
    statementCollisionSpace: QuadtreeCollisionSpace;
    /** Book-keeping mapping collision object ID to statement connector metadata */
    statementConnectors: Record<number, StatementConnectorMeta>;

    /** Collision space tracking argument connection points */
    argumentCollisionSpace: QuadtreeCollisionSpace;
    /** Book-keeping mapping collision object ID to argument connector metadata */
    argumentConnectors: Record<number, ArgumentConnectorMeta>;

    /** Creates a new tower in the workspace. */
    createTower: (tower: TowerState) => void;
    /** Removes a tower from the workspace by its ID. */
    removeTower: (id: string) => void;
    /** Updates the position of an existing tower. */
    updateTowerPosition: (id: string, position: Point) => void;
    /** Synchronises the statement collision points for a tower after layout */
    syncStatementConnectors: (towerId: string, root: TowerNode) => void;
    /** Synchronises the argument collision points for a tower after layout */
    syncArgumentConnectors: (towerId: string, root: TowerNode) => void;
    /** Detaches a brick from its parent and forms a new tower */
    detachBrickToNewTower: (
        sourceTowerId: string,
        nodeId: string,
        position: Point,
    ) => string | null;
    /** Merges an argument-joined tower into the host tower that now owns its bricks */
    absorbArgumentTower: (draggedTowerId: string, hostTowerId: string) => void;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set, get) => ({
        towers: {},
        statementCollisionSpace: new QuadtreeCollisionSpace(4000, 4000),
        statementConnectors: {},
        argumentCollisionSpace: new QuadtreeCollisionSpace(4000, 4000),
        argumentConnectors: {},

        createTower: (tower) => {
            set((state) => ({
                towers: { ...state.towers, [tower.id]: tower },
            }));
        },

        removeTower: (id) => {
            set((state) => {
                const newTowers = { ...state.towers };
                delete newTowers[id];

                // Cleanup statement collision points
                const stmtIds = Object.values(state.statementConnectors)
                    .filter((meta) => meta.towerId === id)
                    .map((meta) => meta.id);
                const newStatementConnectors = { ...state.statementConnectors };
                if (stmtIds.length > 0) {
                    state.statementCollisionSpace.removeObjects(stmtIds);
                    for (const rid of stmtIds) delete newStatementConnectors[rid];
                }

                // Cleanup argument collision points
                const argIds = Object.values(state.argumentConnectors)
                    .filter((meta) => meta.towerId === id)
                    .map((meta) => meta.id);
                const newArgumentConnectors = { ...state.argumentConnectors };
                if (argIds.length > 0) {
                    state.argumentCollisionSpace.removeObjects(argIds);
                    for (const rid of argIds) delete newArgumentConnectors[rid];
                }

                return {
                    towers: newTowers,
                    statementConnectors: newStatementConnectors,
                    argumentConnectors: newArgumentConnectors,
                };
            });
        },

        updateTowerPosition: (id, position) => {
            set((state) => {
                if (!state.towers[id]) return state;
                return {
                    towers: {
                        ...state.towers,
                        [id]: { ...state.towers[id], position },
                    },
                };
            });
        },

        syncStatementConnectors: (towerId, root) => {
            set((state) => {
                // Remove old connectors for this tower first
                const oldIds = Object.values(state.statementConnectors)
                    .filter((meta) => meta.towerId === towerId)
                    .map((meta) => meta.id);

                if (oldIds.length > 0) {
                    state.statementCollisionSpace.removeObjects(oldIds);
                }

                // Extract new connectors
                const results = extractStatementConnectors(towerId, root);
                if (results.length === 0) {
                    if (oldIds.length === 0) return state;

                    const newConnectors = { ...state.statementConnectors };
                    for (const rid of oldIds) {
                        delete newConnectors[rid];
                    }
                    return { statementConnectors: newConnectors };
                }

                const newObjects = results.map((r) => r.object);
                state.statementCollisionSpace.createObjects(newObjects);

                const newConnectors = { ...state.statementConnectors };
                for (const rid of oldIds) {
                    delete newConnectors[rid];
                }
                for (const r of results) {
                    newConnectors[r.meta.id] = r.meta;
                }

                console.groupCollapsed(
                    `[Collision Space] Synced ${results.length} connectors for tower ${towerId}`,
                );
                console.log('Connectors:');
                console.table(
                    results.map((r) => ({
                        type: r.meta.type,
                        brickId: r.meta.brickId,
                        x: r.object.x,
                        y: r.object.y,
                    })),
                );
                console.groupEnd();

                return { statementConnectors: newConnectors };
            });
        },

        syncArgumentConnectors: (towerId, root) => {
            set((state) => {
                // Remove old connectors for this tower first
                const oldIds = Object.values(state.argumentConnectors)
                    .filter((meta) => meta.towerId === towerId)
                    .map((meta) => meta.id);

                if (oldIds.length > 0) {
                    state.argumentCollisionSpace.removeObjects(oldIds);
                }

                // Extract new connectors
                const results = extractArgumentConnectors(towerId, root);

                const newConnectors = { ...state.argumentConnectors };
                for (const rid of oldIds) delete newConnectors[rid];

                if (results.length === 0) {
                    return oldIds.length === 0 ? state : { argumentConnectors: newConnectors };
                }

                state.argumentCollisionSpace.createObjects(results.map((r) => r.object));
                for (const r of results) newConnectors[r.meta.id] = r.meta;

                return { argumentConnectors: newConnectors };
            });
        },

        detachBrickToNewTower: (sourceTowerId, nodeId, position) => {
            let newTowerId: string | null = null;
            set((state) => {
                const tower = state.towers[sourceTowerId];
                if (!tower) return state;

                // Traverse the tree to find the target node and the node that points to it (its parent)
                const stack: TowerNode[] = [tower.root];
                let target: TowerNode | null = null;
                let foundPrev: Extract<TowerNode, { kind: 'statement' }> | null = null;
                let foundCavityParent: Extract<TowerNode, { kind: 'statement' }> | null = null;

                while (stack.length > 0) {
                    const current = stack.pop()!;
                    if (current.model.id === nodeId) {
                        target = current;
                        break; // In a valid tree we won't hit this unless it's the root, but we handle it just in case
                    }
                    if (current.kind === 'statement') {
                        if (current.next) {
                            if (current.next.model.id === nodeId) {
                                target = current.next;
                                foundPrev = current;
                                break;
                            }
                            stack.push(current.next);
                        }
                        if (current.nestedNext) {
                            if (current.nestedNext.model.id === nodeId) {
                                target = current.nestedNext;
                                foundCavityParent = current;
                                break;
                            }
                            stack.push(current.nestedNext);
                        }
                    } else if (current.kind === 'expression') {
                        for (let i = 0; i < current.args.length; i++) {
                            const arg = current.args[i];
                            if (arg && arg.model.id === nodeId) {
                                target = arg;
                                break;
                            }
                            if (arg) stack.push(arg);
                        }
                    }
                }

                if (!target) return state;

                // Sever the link from the parent to the target node

                if (foundPrev) {
                    foundPrev.next = null;
                } else if (foundCavityParent) {
                    foundCavityParent.nestedNext = null;
                } else {
                    const stack2: TowerNode[] = [tower.root];
                    while (stack2.length > 0) {
                        const current = stack2.pop()!;
                        if (current.kind === 'expression') {
                            const idx = current.args.findIndex((a) => a === target);
                            if (idx !== -1) {
                                current.args[idx] = null;
                                break;
                            }
                            for (const arg of current.args) {
                                if (arg) stack2.push(arg);
                            }
                        } else if (current.kind === 'statement') {
                            if (current.next) stack2.push(current.next);
                            if (current.nestedNext) stack2.push(current.nestedNext);
                        }
                    }
                }

                if ('prev' in target) {
                    target.prev = null;
                }

                newTowerId = `tower-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const newTower: TowerState = {
                    id: newTowerId,
                    position,
                    root: target,
                };

                return {
                    towers: {
                        ...state.towers,
                        [sourceTowerId]: { ...tower, root: { ...tower.root } },
                        [newTowerId]: newTower,
                    },
                };
            });
            return newTowerId;
        },

        absorbArgumentTower: (draggedTowerId, hostTowerId) => {
            // The join already spliced the two node graphs together, so the absorbed tower is
            // redundant; dropping it also purges its stale collision points.
            get().removeTower(draggedTowerId);

            set((state) => {
                const host = state.towers[hostTowerId];
                if (!host) return state;

                // Replacing the root reference is what makes the layout hook re-run over the
                // enlarged graph, the same signal `detachBrickToNewTower` uses after severing a link.
                return {
                    towers: {
                        ...state.towers,
                        [hostTowerId]: { ...host, root: { ...host.root } },
                    },
                };
            });
        },
    })),
);

/**
 * Searches across all towers for a specific node ID.
 * Returns the node and the tower it belongs to.
 */
export function findNodeAndTower(id: string): { node: TowerNode; tower: TowerState } | null {
    const towers = useWorkspaceStore.getState().towers;
    for (const tower of Object.values(towers)) {
        const stack = [tower.root];
        while (stack.length > 0) {
            const current = stack.pop()!;
            if (current.model.id === id) {
                return { node: current, tower };
            }

            if (current.kind === 'statement') {
                if (current.next) stack.push(current.next);
                if (current.nestedNext) stack.push(current.nestedNext);
            } else if (current.kind === 'expression') {
                for (const arg of current.args) {
                    if (arg) stack.push(arg);
                }
            }
        }
    }
    return null;
}
