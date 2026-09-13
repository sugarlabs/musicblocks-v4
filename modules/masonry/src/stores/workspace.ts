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
import { exportWorkspace as exportWorkspaceUtil, importProject } from '@/utils/import-export';
import type { ExportedProject, ImportIdStrategy } from '@/@types/import-export.types';
import { useBrickLayoutStore } from '@/stores/brick';
import { listNodes, listVisibleNodes } from '@/utils/tower-traversal';

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;
    /** ID of the currently selected brick, or null when nothing is selected */
    selectedBrickId: string | null;

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
    /** Selects a brick by its ID */
    selectBrick: (id: string) => void;

    /** Clears the current brick selection */
    clearSelection: () => void;
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
    /** Merges a joined tower into the host tower that now owns its bricks */
    absorbTower: (draggedTowerId: string, hostTowerId: string) => void;
    /** Re-runs every tower's layout, leaving the towers where they are */
    refreshTowerLayouts: () => void;
    /** Folds or unfolds a brick's nesting cavity and re-runs the layout of the tower holding it */
    setNestingFold: (brickId: string, isFolded: boolean) => void;
    /** Serializes the entire workspace into a flat JSON-serializable structure */
    exportWorkspace: () => ExportedProject;
    /**
     * Replaces the workspace with the project a payload describes, throwing it out unchanged if the
     * payload is invalid. Merging into the current workspace is not supported yet.
     */
    importWorkspace: (payload: unknown, strategy?: ImportIdStrategy) => void;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set, get) => ({
        towers: {},
        selectedBrickId: null,
        statementCollisionSpace: new QuadtreeCollisionSpace(4000, 4000),
        statementConnectors: {},
        argumentCollisionSpace: new QuadtreeCollisionSpace(4000, 4000),
        argumentConnectors: {},

        createTower: (tower) => {
            set((state) => ({
                towers: { ...state.towers, [tower.id]: tower },
            }));
        },
        selectBrick: (id) => {
            set({ selectedBrickId: id });
        },
        clearSelection: () => {
            set({ selectedBrickId: null });
        },

        removeTower: (id) => {
            set((state) => {
                const newTowers = { ...state.towers };
                delete newTowers[id];
                // The selection follows the brick rather than the tower holding it. A join splices
                // the dragged brick into its host before the emptied tower is dropped through
                // here, so leaving this tower is not the same as leaving the canvas: what decides
                // it is whether any tower that remains still holds the brick.
                const selectedBrickId = state.selectedBrickId;
                const selectionSurvives =
                    selectedBrickId === null ||
                    Object.values(newTowers).some((tower) =>
                        listNodes(tower.root).some((node) => node.model.id === selectedBrickId),
                    );

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
                    selectedBrickId: selectionSurvives ? state.selectedBrickId : null,
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
                let foundArgParent: TowerNode | null = null;
                let foundArgIndex: number | null = null;

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
                    }
                    if (current.kind === 'statement' || current.kind === 'expression') {
                        for (let i = 0; i < current.args.length; i++) {
                            const arg = current.args[i];
                            if (arg) {
                                if (arg.model.id === nodeId) {
                                    target = arg;
                                    foundArgParent = current;
                                    foundArgIndex = i;
                                    break;
                                }
                                stack.push(arg);
                            }
                        }
                        if (target) break;
                    }
                }

                if (!target) return state;

                // Sever the link from the parent to the target node

                if (foundPrev) {
                    foundPrev.next = null;
                } else if (foundCavityParent) {
                    foundCavityParent.nestedNext = null;
                } else if (foundArgParent && foundArgIndex !== null) {
                    foundArgParent.args[foundArgIndex] = null;
                }

                if ('prev' in target) {
                    target.prev = null;
                }
                if ('parent' in target) {
                    target.parent = null;
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

        absorbTower: (draggedTowerId, hostTowerId) => {
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

        refreshTowerLayouts: () => {
            set((state) => {
                const ids = Object.keys(state.towers);
                if (ids.length === 0) return state;

                const towers: Record<string, TowerState> = {};
                for (const id of ids) {
                    const tower = state.towers[id];
                    // Only the root reference changes — `position` keeps its identity, so the
                    // layout's origin fast-path stays quiet and the tower does not move.
                    towers[id] = { ...tower, root: { ...tower.root } };
                }

                return { towers };
            });
        },

        setNestingFold: (brickId, isFolded) => {
            const found = findNodeAndTower(brickId);
            if (!found || found.node.kind !== 'statement') return;

            const { node, tower } = found;
            // A write that changes nothing must not cost a re-layout; the model swallows it anyway.
            if (node.model.isNestingFolded === isFolded) return;

            // Written outside the store update because the flag notifies synchronously, and doing
            // that inside a `set` would update React from within a store update — the same reason
            // `useWorkspaceScale` writes `scaleLevel` before refreshing the layouts.
            node.model.isNestingFolded = isFolded;

            // A cavity opening again hands its bricks back to the canvas at whatever position they
            // held when it shut, which the tower may have moved away from since. `positioned` is
            // what `TowerBrick` hides behind, so dropping it keeps them out of sight until the pass
            // below places them.
            if (!isFolded && node.nestedNext) {
                const reshown = listVisibleNodes(node.nestedNext).map((node) => node.model.id);
                useBrickLayoutStore
                    .getState()
                    .setPositioned(Object.fromEntries(reshown.map((id) => [id, false])));
            }

            set((state) => {
                const current = state.towers[tower.id];
                if (!current) return state;

                // Only the root reference changes: the layout hook re-runs off it and `Workspace`
                // re-lists what the fold leaves on screen. `position` keeps its identity, so the
                // origin fast-path stays quiet and the tower stays anchored.
                return {
                    towers: {
                        ...state.towers,
                        [tower.id]: { ...current, root: { ...current.root } },
                    },
                };
            });
        },

        exportWorkspace: () => exportWorkspaceUtil(get().towers),

        importWorkspace: (payload, strategy) => {
            // Everything that can reject the payload happens first, and reads nothing from the
            // store: if this throws, the workspace below is still whole.
            const towers = importProject(payload, strategy);

            const stale = Object.values(get().towers).flatMap((tower) =>
                listNodes(tower.root).map((node) => node.model.id),
            );

            // `removeTower` per tower rather than a bulk wipe, so purging the Collision spaces and
            // their book-keeping stays in the one place that owns it. The layout entries then go in
            // a single write, and only after their towers have left the graph — `TowerBrick` reads
            // `coords[id]` unguarded, the ordering `discardTower` documents for the same reason.
            for (const id of Object.keys(get().towers)) get().removeTower(id);
            useBrickLayoutStore.getState().clearBricks(stale);

            set({ towers });
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
            }
            if (current.kind === 'statement' || current.kind === 'expression') {
                for (const arg of current.args) {
                    if (arg) stack.push(arg);
                }
            }
        }
    }
    return null;
}
