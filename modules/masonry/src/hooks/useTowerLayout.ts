import { useEffect, useRef } from 'react';

import type { Point } from '@/@types/common.types';
import { TowerNode } from '@/@types/tower.types';
import { useBrickLayoutStore } from '@/stores/brick';
import { listNodes, traverseBottomUp, traverseTopDown } from '@/utils/tower-traversal';

/**
 * Resolves the layout of a tower rooted at `root`.
 *
 * Lists every node in the tree and ensures each has an entry in the brick layout store,
 * initializing it once per node so consumers can read and update its sizing and position state.
 *
 * Bricks are positioned relative to the tower's origin.
 *
 * Returns the tower's node list.
 */
export function useTowerLayout(root: TowerNode, origin: Point, layoutVersion = 0) {
    const { setCoords, setMounted, setPositioned } = useBrickLayoutStore.getState();

    const isInitialized = useRef(false);

    const nodesRef = useRef<TowerNode[]>([]);

    const nodes = listNodes(root);
    nodesRef.current = nodes;

    if (!isInitialized.current) {
        const ids = nodes.map((node) => node.model.id);

        setCoords(Object.fromEntries(ids.map((id) => [id, { x: 0, y: 0 }])));
        setMounted(Object.fromEntries(ids.map((id) => [id, false])));
        setPositioned(Object.fromEntries(ids.map((id) => [id, false])));

        isInitialized.current = true;
    } else {
        // Seed any nodes that appeared since the last render but have no layout entry yet — e.g. a
        // joined-in argument subtree whose bricks were tracked under a now-absorbed tower. Absorbed
        // bricks usually keep their entries, so this is a defensive backstop against a missing one
        // (a TowerBrick reads coords[id] directly and would otherwise crash).
        const { coords } = useBrickLayoutStore.getState();
        const newIds = nodes.map((node) => node.model.id).filter((id) => coords[id] === undefined);

        if (newIds.length > 0) {
            setCoords(Object.fromEntries(newIds.map((id) => [id, { x: 0, y: 0 }])));
            setMounted(Object.fromEntries(newIds.map((id) => [id, false])));
            setPositioned(Object.fromEntries(newIds.map((id) => [id, false])));
        }
    }

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
                    if (node.kind === 'statement' && node.nestedNext) {
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

                setPositioned(Object.fromEntries(positioned.map((node) => [node.model.id, true])));
            }
        }

        // We run the async process once per root/layoutVersion change
        processLayout();

        return () => {
            isCancelled = true;
        };
        // Depend on the primitive co-ordinates, not the origin object — callers may pass a fresh
        // object literal each render, which would re-trigger the layout on every render.
        // `layoutVersion` re-runs the layout on an in-place graph change (same `root` reference).
    }, [root, origin.x, origin.y, layoutVersion, setCoords, setMounted, setPositioned]);

    return nodes;
}
