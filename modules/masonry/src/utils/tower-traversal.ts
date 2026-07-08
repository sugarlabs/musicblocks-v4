import { TowerNode, TowerStatementNode } from '@/@types/tower.types';

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
 * Collects every node reachable from `root` in a tower's connected graph.
 *
 * Walks the tree with an explicit stack, following `args` and `nestedNext` connections and
 * pulling in each statement's full `next` chain via `pushChain`. The result is unordered — it's
 * meant to be reduced per node (e.g. into layout state), not walked in tree order.
 */
export function listNodes(root: TowerNode): TowerNode[] {
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

                if (node.nestedNext) {
                    pushChain(node.nestedNext, stack);
                }
                break;
        }
    }

    return nodes;
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
            if (node.nestedNext != null) traversalStack.push(node.nestedNext);
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
            // Statements only depend on their nesting cavity chain
            if (node.nestedNext != null) {
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
