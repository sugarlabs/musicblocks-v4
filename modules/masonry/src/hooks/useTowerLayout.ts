import { useEffect, useLayoutEffect, useRef } from 'react';

import type { Point } from '@/@types/common.types';
import { TowerNode } from '@/@types/tower.types';
import { useBrickLayoutStore } from '@/stores/brick';
import {
    hidesCavity,
    listVisibleNodes,
    traverseBottomUp,
    traverseTopDown,
} from '@/utils/tower-traversal';

/**
 * Resolves the layout of a tower rooted at `root`.
 *
 * Lists the tower's visible nodes and ensures each has an entry in the brick layout store,
 * initializing it once per node so consumers can read and update its sizing and position state.
 *
 * Bricks held inside a folded cavity are left out: nothing renders them, so they have no sizing or
 * position to resolve. Their entries are seeded again by the fold being lifted, which puts them
 * back on this list.
 *
 * A fold change re-runs the whole pass, which is what closes the gap the cavity held open — the
 * tower is re-seated for it by `setNestingFold`, the same signal a scale change uses.
 *
 * Bricks are positioned relative to the tower's origin.
 *
 * Returns the tower's visible node list.
 */
export function useTowerLayout(root: TowerNode, origin: Point) {
    const { setCoords, setMounted, setPositioned } = useBrickLayoutStore.getState();

    const isInitialized = useRef(false);

    const nodesRef = useRef<TowerNode[]>([]);

    const nodes = listVisibleNodes(root);
    nodesRef.current = nodes;

    useLayoutEffect(() => {
        if (!isInitialized.current) {
            const storeState = useBrickLayoutStore.getState();
            const newCoords: Record<string, Point> = {};
            const newMounted: Record<string, boolean> = {};
            const newPositioned: Record<string, boolean> = {};

            for (const node of nodesRef.current) {
                const id = node.model.id;
                if (storeState.coords[id] === undefined) {
                    newCoords[id] = { x: 0, y: 0 };
                }
                if (storeState.mounted[id] === undefined) {
                    newMounted[id] = false;
                }
                if (storeState.positioned[id] === undefined) {
                    newPositioned[id] = false;
                }
            }

            if (Object.keys(newCoords).length > 0) setCoords(newCoords);
            if (Object.keys(newMounted).length > 0) setMounted(newMounted);
            if (Object.keys(newPositioned).length > 0) setPositioned(newPositioned);

            isInitialized.current = true;
        }
    }, [setCoords, setMounted, setPositioned]);

    // We need to keep a ref to the latest origin to avoid stale closures in the async process
    const originRef = useRef(origin);
    useEffect(() => {
        originRef.current = origin;
    }, [origin.x, origin.y]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: primitive deps prevent stale object reference

    useEffect(() => {
        let isCancelled = false;

        async function processLayout() {
            const bottomUpGen = traverseBottomUp(root);

            for (const batch of bottomUpGen) {
                if (isCancelled) return;

                // Propagate dimensions from already-rendered children into this batch's models
                batch.forEach((node) => {
                    if (node.kind === 'expression' || node.kind === 'statement') {
                        node.model.argDims = node.args.map((arg) =>
                            arg ? { w: arg.model.dims.w, h: arg.model.dims.h } : null,
                        );
                    }
                    if (node.kind === 'statement') {
                        // A folded cavity is left collapsed rather than measured: its chain is off
                        // this pass, so the brick reports its head alone and everything below it
                        // rides up by what the cavity held.
                        if (node.nestedNext && !hidesCavity(node)) {
                            // Sum heights and find max width of the inner statement chain
                            let current: TowerNode | null = node.nestedNext;
                            let totalH = 0;
                            let maxW = 0;
                            while (current !== null) {
                                totalH += current.model.dims.h;
                                if (current.model.dims.w > maxW) maxW = current.model.dims.w;
                                current = current.kind === 'statement' ? current.next : null;
                            }
                            node.model.nestingDims = { w: maxW, h: totalH };
                        } else if (node.model.nestingDims !== null) {
                            // Guarded because the write notifies: a brick that is already
                            // collapsed must not re-render on every pass over its tower.
                            node.model.nestingDims = null;
                        }
                    }
                });

                // Mark this batch's bricks mounted so TowerBricks render (and measure their widgetDims)
                setMounted(Object.fromEntries(batch.map((node) => [node.model.id, true])));

                // Yield to the browser. React will flush updates, render the TowerBricks,
                // and useLayoutEffect in BrickFixed will measure the DOM and set model.widgetDims.
                await new Promise((resolve) => setTimeout(resolve, 0));

                if (isCancelled) return;

                // Now compute the full brick dimensions based on the freshly measured widgetDims;
                // used directly via node.model.dims by parents and the outline pass below.
                batch.forEach((node) => {
                    node.model.computeDims();
                });
            }

            // All dims are measured by now, so compute every brick's position in one
            // synchronous top-down pass and propagate to the store in a single update.

            // computeDims() only computes outer dims; bricks with a nesting cavity or argument
            // slots also need their outline bounds for the child offsets.
            nodesRef.current.forEach((node) => {
                if (node.kind === 'value') return;
                if (
                    node.args.some((arg) => arg !== null) ||
                    (node.kind === 'statement' && node.nestedNext)
                ) {
                    node.model.computeOutline();
                }
            });

            // Use the latest origin from the ref to avoid applying a stale layout position
            const positioned = traverseTopDown(root, {
                x: originRef.current.x,
                y: originRef.current.y,
            });

            if (positioned.length > 0) {
                setCoords(
                    Object.fromEntries(
                        positioned.map((node) => [
                            node.model.id,
                            { x: node.model.position.x, y: node.model.position.y },
                        ]),
                    ),
                );

                setPositioned(Object.fromEntries(positioned.map((node) => [node.model.id, true])));
            }

            isInitialized.current = true;
        }

        // We run the async process once per root/layoutVersion change
        processLayout();

        return () => {
            isCancelled = true;
        };
    }, [root, setCoords, setMounted, setPositioned]);

    // Fast-path for moving a tower without recalculating its internal layout
    useEffect(() => {
        // Skip if layout is not fully measured yet
        if (!isInitialized.current) return;

        const positioned = traverseTopDown(root, { x: origin.x, y: origin.y });

        if (positioned.length > 0) {
            setCoords(
                Object.fromEntries(
                    positioned.map((node) => [
                        node.model.id,
                        { x: node.model.position.x, y: node.model.position.y },
                    ]),
                ),
            );
        }
    }, [origin.x, origin.y, root, setCoords]);

    return nodes;
}
