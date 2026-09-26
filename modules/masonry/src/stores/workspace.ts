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
import {
    exportSubtree,
    exportWorkspace as exportWorkspaceUtil,
    importProject,
    reconstructTowers,
    resolveIds,
} from '@/utils/import-export';
import type { ExportedProject, ImportIdStrategy } from '@/@types/import-export.types';
import { useBrickLayoutStore } from '@/stores/brick';
import { listNodes, listVisibleNodes } from '@/utils/tower-traversal';

/** How far a duplicated tower sits from the tower it was copied from. */
const DUPLICATE_TOWER_OFFSET: Point = { x: 60, y: 40 };

export interface WorkspaceStore {
    /** Record of all towers currently in the workspace, keyed by their unique ID */
    towers: Record<string, TowerState>;
    /** ID of the currently selected brick, or null when nothing is selected */
    selectedBrickId: string | null;

    /**
     * Whether all rendered bricks are hidden from the canvas. A pure view flag — toggling it
     * leaves the tower graph and the brick layout store untouched.
     */
    areBricksHidden: boolean;

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
    /**
     * Copies a brick and the sub-tree a drag would lift with it into a fresh, independent tower,
     * placed offset from the source tower and connected to nothing.
     */
    duplicateBrickToNewTower: (nodeId: string) => string | null;
    /** Merges a joined tower into the host tower that now owns its bricks */
    absorbTower: (draggedTowerId: string, hostTowerId: string) => void;
    /**
     * Removes a single brick from a tower without touching the chain below it.
     *
     * The brick's `next` statement (if any) is reconnected to whatever held the brick — its `prev`
     * in the linear sequence, the cavity owner, or an argument slot — so no statements are lost.
     * The brick itself, its inline argument children, and its own cavity contents are severed and
     * their IDs are returned for layout-store cleanup. When the removed brick was the tower root and
     * has no `next`, the tower itself is also removed from the workspace.
     *
     * @returns The IDs of every brick node that was removed (the target plus its args and cavity),
     *          or null when the tower or node could not be found.
     */
    spliceBrick: (towerId: string, nodeId: string) => string[] | null;
    /** Re-runs every tower's layout, leaving the towers where they are */
    refreshTowerLayouts: () => void;
    /** Sets whether all rendered bricks are hidden from the canvas. */
    setBricksHidden: (hidden: boolean) => void;
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

export type ParentLink =
    | { kind: 'prev'; node: Extract<TowerNode, { kind: 'statement' }> }
    | { kind: 'nestedNext'; node: Extract<TowerNode, { kind: 'statement' }> }
    | { kind: 'arg'; node: TowerNode; index: number }
    | { kind: 'root' };

/**
 * Traverses a tower tree to locate a target node and how it is linked to its parent.
 *
 * @param root - The root node of the tower to search.
 * @param nodeId - The model ID of the brick node to find.
 * @returns The target node and its parent link, or null if the node does not exist in the tree.
 */
export function findParentLink(
    root: TowerNode,
    nodeId: string,
): { target: TowerNode; parentLink: ParentLink } | null {
    if (root.model.id === nodeId) {
        return { target: root, parentLink: { kind: 'root' } };
    }

    const stack: TowerNode[] = [root];
    while (stack.length > 0) {
        const current = stack.pop()!;
        if (current.kind === 'statement') {
            if (current.next) {
                if (current.next.model.id === nodeId) {
                    return { target: current.next, parentLink: { kind: 'prev', node: current } };
                }
                stack.push(current.next);
            }
            if (current.nestedNext) {
                if (current.nestedNext.model.id === nodeId) {
                    return { target: current.nestedNext, parentLink: { kind: 'nestedNext', node: current } };
                }
                stack.push(current.nestedNext);
            }
        }
        if (current.kind === 'statement' || current.kind === 'expression') {
            for (let i = 0; i < current.args.length; i++) {
                const arg = current.args[i];
                if (arg) {
                    if (arg.model.id === nodeId) {
                        return { target: arg, parentLink: { kind: 'arg', node: current, index: i } };
                    }
                    stack.push(arg);
                }
            }
        }
    }

    return null;
}

/**
 * Tracks the state of the workspace, including all towers positioned within it.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
    subscribeWithSelector((set, get) => ({
        towers: {},
        selectedBrickId: null,
        areBricksHidden: false,
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

                const found = findParentLink(tower.root, nodeId);
                if (!found) return state;

                const { target, parentLink } = found;

                // Sever the link from the parent to the target node
                if (parentLink.kind === 'prev') {
                    parentLink.node.next = null;
                } else if (parentLink.kind === 'nestedNext') {
                    parentLink.node.nestedNext = null;
                } else if (parentLink.kind === 'arg') {
                    (parentLink.node as Extract<TowerNode, { args: (TowerNode | null)[] }>).args[
                        parentLink.index
                    ] = null;
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

        duplicateBrickToNewTower: (nodeId) => {
            const found = findNodeAndTower(nodeId);
            if (!found) return null;

            // Reconstruct the drag-reachable sub-tree as an independent tower with fresh IDs.
            const project = exportSubtree(found.node);
            const [duplicated] = Object.values(
                reconstructTowers(project, resolveIds(project, 'remint')),
            );

            // Position the copy offset from the selected brick, falling back to tower position if unlaid.
            const origin =
                found.node.model.position.x !== 0 || found.node.model.position.y !== 0
                    ? found.node.model.position
                    : found.tower.position;

            duplicated.position = {
                x: origin.x + DUPLICATE_TOWER_OFFSET.x,
                y: origin.y + DUPLICATE_TOWER_OFFSET.y,
            };

            get().createTower(duplicated);

            return duplicated.id;
        },

        spliceBrick: (towerId, nodeId) => {
            const state = get();
            const tower = state.towers[towerId];
            if (!tower) return null;

            const found = findParentLink(tower.root, nodeId);
            if (!found) return null;

            const { target, parentLink } = found;

            // ── Collect IDs to remove: target + its args + its own cavity (not next) ──
            // `next` is intentionally excluded — it will survive by being re-wired.
            /**
             * Recursively gathers a brick node along with its argument subtree and cavity contents,
             * omitting its linear `next` statement chain so the chain can be spliced and preserved.
             *
             * @param node - The root brick node to collect subtree elements for.
             * @returns An array of all nodes belonging strictly to this brick.
             */
            function collectOwnNodes(node: TowerNode): TowerNode[] {
                const collected: TowerNode[] = [node];
                if (node.kind === 'statement' || node.kind === 'expression') {
                    for (const arg of node.args) {
                        if (arg) collected.push(...collectOwnNodes(arg));
                    }
                }
                // Cavity contents belong to this brick and are deleted with it.
                if (node.kind === 'statement' && node.nestedNext) {
                    collected.push(...listNodes(node.nestedNext));
                }
                return collected;
            }
            const removedIds = collectOwnNodes(target).map((n) => n.model.id);

            // ── Determine what replaces the target in the parent slot ──────────────────
            // Only statement bricks form linear sequences via `next`; argument and cavity
            // bricks are not statement-chained, so there is nothing to re-wire there.
            const successor = target.kind === 'statement' && target.next ? target.next : null;

            // ── Re-wire the parent link to skip over the target ────────────────────────
            if (parentLink.kind === 'root') {
                if (successor) {
                    if (successor.kind === 'statement') {
                        successor.prev = null;
                    }
                    // The chain below becomes the new tower root.
                    set((s) => ({
                        towers: {
                            ...s.towers,
                            [towerId]: { ...tower, root: successor },
                        },
                    }));
                } else {
                    // No successor — the tower is now empty, remove it entirely.
                    get().removeTower(towerId);
                }
            } else {
                if (parentLink.kind === 'prev') {
                    parentLink.node.next = successor;
                    if (successor && successor.kind === 'statement') {
                        successor.prev = parentLink.node;
                    }
                } else if (parentLink.kind === 'nestedNext') {
                    parentLink.node.nestedNext = successor ?? null;
                    if (successor && successor.kind === 'statement') {
                        successor.prev = parentLink.node;
                    }
                } else if (parentLink.kind === 'arg') {
                    // Argument bricks have no `next` chain, so the slot simply becomes empty.
                    (parentLink.node as Extract<TowerNode, { args: (TowerNode | null)[] }>).args[
                        parentLink.index
                    ] = null;
                }

                // Touch the tower root so the layout hook re-runs the full graph.
                set((s) => ({
                    towers: {
                        ...s.towers,
                        [towerId]: { ...tower, root: { ...tower.root } },
                    },
                }));
            }

            return removedIds;
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

        setBricksHidden: (hidden) => {
            set({ areBricksHidden: hidden });
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

            // Commit history after the layout update is queued
            import('@/stores/history').then(({ useWorkspaceHistoryStore }) => {
                useWorkspaceHistoryStore.getState().commit();
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
