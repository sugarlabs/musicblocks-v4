import type { Point, Size } from '@/@types/common.types';
import { TowerNode, TowerStatementNode } from '@/@types/tower.types';
import type { TowerState } from '@/@types/workspace.types';

/**
 * Pushes `start` onto `stack`, along with the rest of its statement chain if it has one.
 *
 * Statement nodes form a linear sequence via `next` pointers, so a single call here queues the
 * whole run of statements for traversal rather than just the first one.
 */
function pushChain(start: TowerNode, stack: TowerNode[]) {
    if (start.kind !== 'statement') {
        stack.push(start);
        return;
    }

    let current: TowerStatementNode | null = start;

    while (current) {
        stack.push(current);
        current = current.next as TowerStatementNode | null;
    }
}

/**
 * Whether `node` hides what its cavity holds.
 *
 * Only a statement brick has a cavity to fold, so every other kind answers false. The fold is the
 * one reason a node in the graph is not on screen, so this is the single predicate the visible
 * walk and the layout consult; anything else that can hide a sub-tree later belongs here rather
 * than at a call site.
 */
export function hidesCavity(node: TowerNode): boolean {
    return node.kind === 'statement' && node.model.isNestingFolded;
}

/**
 * Collects the nodes reachable from `root` in a tower's connected graph.
 *
 * Walks the tree with an explicit stack, following `args` and `nestedNext` connections and
 * pulling in each statement's full `next` chain via `pushChain`. The result is unordered — it's
 * meant to be reduced per node (e.g. into layout state), not walked in tree order.
 *
 * With `skipFolded` set, a folded brick's `nestedNext` is left unvisited, so its cavity contents
 * drop out of the result. The brick itself, its arguments and its `next` chain stay: a fold hides
 * what a brick holds, not the brick or what follows it.
 *
 * The walk only reads pointers, so a skipped sub-tree is untouched rather than detached, and it
 * comes back whole — nested fold states included — the moment the fold is lifted.
 */
function walk(root: TowerNode, skipFolded: boolean): TowerNode[] {
    const nodes: TowerNode[] = [];
    const stack: TowerNode[] = [];

    pushChain(root, stack);

    while (stack.length > 0) {
        const node = stack.pop()!;
        nodes.push(node);

        switch (node.kind) {
            case 'expression':
                for (const arg of node.args) {
                    if (arg) pushChain(arg, stack);
                }
                break;
            case 'statement':
                for (const arg of node.args) {
                    if (arg) pushChain(arg, stack);
                }

                if (node.nestedNext && !(skipFolded && hidesCavity(node))) {
                    pushChain(node.nestedNext, stack);
                }
                break;
        }
    }

    return nodes;
}

/**
 * Collects every node reachable from `root` in a tower's connected graph, folded or not.
 *
 * This is the graph-complete list: the one to use whenever a hidden brick still has to be counted,
 * such as serialising a tower, re-scaling its bricks, or clearing their layout entries. Callers
 * that speak for what is on screen want {@link listVisibleNodes} instead.
 */
export function listNodes(root: TowerNode): TowerNode[] {
    return walk(root, false);
}

/**
 * Collects the nodes of a tower that a fold leaves on screen, skipping every sub-tree held inside
 * a folded cavity, however deeply the folds nest.
 *
 * This is the list to render from and to build the Collision spaces from, so a hidden brick is
 * neither drawn nor offered as a snap candidate. It is a view of the graph, not a change to it:
 * the skipped nodes are still linked exactly as they were.
 */
export function listVisibleNodes(root: TowerNode): TowerNode[] {
    return walk(root, true);
}

/**
 * Measures how far a tower reaches right and down from its origin: the farthest right edge and the
 * farthest bottom edge over its visible bricks, each read as the brick's laid-out position in
 * `coords` relative to `tower.position`, plus its `model.dims`.
 *
 * The root sits at the origin by definition, so its own dims are the floor of the result: a tower
 * whose bricks have no laid-out position yet — or still hold the zero placeholder the layout seeds
 * ahead of its first pass — measures as its root brick rather than as nothing, so a caller laying
 * towers out side by side never stacks two of them on the same spot.
 *
 * Bricks inside a folded cavity are not on screen, so they take no room here either.
 *
 * @param tower - The tower to measure; only its root and position are read.
 * @param coords - Laid-out brick positions keyed by brick id, as the brick layout store holds them.
 * @returns The width and height of the tower's bounding box, anchored at its origin.
 */
export function measureTowerExtent(
    tower: Pick<TowerState, 'root' | 'position'>,
    coords: Record<string, Point>,
): Size {
    const { root, position } = tower;
    let { w, h } = root.model.dims;

    for (const node of listVisibleNodes(root)) {
        const at = coords[node.model.id];
        if (at === undefined) continue;

        w = Math.max(w, at.x - position.x + node.model.dims.w);
        h = Math.max(h, at.y - position.y + node.model.dims.h);
    }

    return { w, h };
}

/**
 * Finds the node in a tower whose brick model id matches `brickId`, or null if none does.
 *
 * Used to resolve a collision-space hit — which carries only ids — back to the live tower node it
 * refers to.
 */
export function findNode(root: TowerNode, brickId: string): TowerNode | null {
    return listNodes(root).find((node) => node.model.id === brickId) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Traverses all nodes in a Brick Tower tree in a single pass, separating them into two buckets:
 * 1. Arguments (Values and Expressions)
 * 2. Statements
 *
 * Calculates the topological height for every node from the bottom up.
 * Since all Arguments are yielded before any Statements, Statements do not mathematically depend
 * on their Arguments for this topological ordering (they only depend on their nesting cavities).
 *
 * Uses a strict iterative two-pass approach to prevent call stack issues on deeply nested trees.
 *
 * A folded cavity is left out: nothing renders what it holds, so there is nothing to measure in
 * there, and the brick's own height no longer depends on it. The chain is measured again by the
 * fold being lifted, which brings it back into this walk.
 *
 * @param root - The root node of the tower tree.
 */
export function* traverseBottomUp(root: TowerNode): Generator<TowerNode[]> {
    // Pass 1: Iterative traversal to build a reverse-post-order array
    const traversalStack = [root];
    const reversePostOrder: TowerNode[] = [];

    while (traversalStack.length > 0) {
        const node = traversalStack.pop()!;
        reversePostOrder.push(node);

        if (node.kind === 'expression' || node.kind === 'statement') {
            for (const arg of node.args) {
                if (arg !== null) traversalStack.push(arg);
            }
        }
        if (node.kind === 'statement') {
            if (node.next !== null) traversalStack.push(node.next);
            if (node.nestedNext != null && !hidesCavity(node)) {
                traversalStack.push(node.nestedNext);
            }
        }
    }

    // Pass 2: Calculate topological height from bottom-up
    const heights = new Map<TowerNode, number>();
    const argsByHeight = new Map<number, TowerNode[]>();
    const stmtsByHeight = new Map<number, TowerNode[]>();

    for (let i = reversePostOrder.length - 1; i >= 0; i--) {
        const node = reversePostOrder[i];
        let maxHeight = -1;

        if (node.kind === 'expression' || node.kind === 'value') {
            // Arguments only depend on their argument children
            if (node.kind === 'expression') {
                for (const arg of node.args) {
                    if (arg !== null) {
                        const h = heights.get(arg) ?? 0;
                        if (h > maxHeight) maxHeight = h;
                    }
                }
            }
        } else if (node.kind === 'statement') {
            // Statements only depend on their nesting cavity chain, and a folded one holds them
            // to nothing: it is not on this walk, so it cannot be waited on either.
            if (node.nestedNext != null && !hidesCavity(node)) {
                let current: TowerNode | null = node.nestedNext;
                while (current !== null) {
                    const h = heights.get(current) ?? 0;
                    if (h > maxHeight) maxHeight = h;
                    current = current.kind === 'statement' ? current.next : null;
                }
            }
        }

        const myHeight = maxHeight + 1;
        heights.set(node, myHeight);

        if (node.kind === 'statement') {
            const bucket = stmtsByHeight.get(myHeight) ?? [];
            bucket.push(node);
            stmtsByHeight.set(myHeight, bucket);
        } else {
            const bucket = argsByHeight.get(myHeight) ?? [];
            bucket.push(node);
            argsByHeight.set(myHeight, bucket);
        }
    }

    // Yield Arguments first (Height 0, then Height 1, etc.)
    const argHeights = Array.from(argsByHeight.keys()).sort((a, b) => a - b);
    for (const h of argHeights) {
        if (argsByHeight.get(h)!.length > 0) {
            yield argsByHeight.get(h)!;
        }
    }

    // Yield Statements next (Height 0, then Height 1, etc.)
    const stmtHeights = Array.from(stmtsByHeight.keys()).sort((a, b) => a - b);
    for (const h of stmtHeights) {
        if (stmtsByHeight.get(h)!.length > 0) {
            yield stmtsByHeight.get(h)!;
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Traverses the Statement and Argument sub-trees of a Brick Tower tree top down, computing each
 * brick's position and writing it into its brick model: the root sits at `origin`, a `next`
 * statement sits flush below its predecessor, a `nestedNext` sits at its parent's position offset
 * by the nesting cavity bounds, and an argument sits at its parent's position offset by its
 * argument slot bounds.
 *
 * A folded brick reports no cavity bounds to offset by, so its chain is left where it stood rather
 * than stacked on top of it. Everything after the fold rides the brick's collapsed height, which is
 * what closes the gap it used to hold open.
 *
 * @param root - The root node of the tower tree.
 * @param origin - The tower's origin co-ordinates; every brick is positioned relative to it.
 * @returns The positioned nodes, each parent preceding its children.
 */
export function traverseTopDown(root: TowerNode, origin: Point = { x: 0, y: 0 }): TowerNode[] {
    const positioned: TowerNode[] = [];

    const stack: { node: TowerNode; x: number; y: number }[] = [
        { node: root, x: origin.x, y: origin.y },
    ];

    while (stack.length > 0) {
        const { node, x, y } = stack.pop()!;

        node.model.setPosition(x, y);
        positioned.push(node);

        // Children's coordinates derive only from the parent's, so they are final at push time.
        if (node.kind === 'expression' || node.kind === 'statement') {
            node.args.forEach((arg, index) => {
                if (!arg) return;
                const slot = node.model.bounds.args?.[index];
                stack.push({ node: arg, x: x + (slot?.x ?? 0), y: y + (slot?.y ?? 0) });
            });
        }
        if (node.kind === 'statement') {
            if (node.next?.kind === 'statement') {
                stack.push({ node: node.next, x, y: y + node.model.dims.h });
            }
            if (node.nestedNext?.kind === 'statement' && !hidesCavity(node)) {
                const nesting = node.model.bounds.nesting;
                stack.push({
                    node: node.nestedNext,
                    x: x + (nesting?.x ?? 0),
                    y: y + (nesting?.y ?? 0),
                });
            }
        }
    }

    return positioned;
}
