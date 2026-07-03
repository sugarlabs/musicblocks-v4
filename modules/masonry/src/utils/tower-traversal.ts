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
 * Yields batches of nodes bottom-up: first, all arguments (deepest leaves first),
 * and then all statements (innermost cavities first).
 *
 * @param root - The root node of the tower tree.
 */
export function* traverseBottomUp(root: TowerNode): Generator<TowerNode[]> {
    const argsByDepth = new Map<number, TowerNode[]>();
    const stmtsByDepth = new Map<number, TowerNode[]>();

    const visited = new Set<TowerNode>();

    /**
     * Recursively traverses the tree.
     * @returns For arguments: the maximum depth of its sub-tree.
     *          For statements: 0 (statements don't report depth to their parents).
     */
    function traverse(node: TowerNode, nestingDepth: number): number {
        if (visited.has(node)) return 0;
        visited.add(node);

        if (node.kind === 'value' || node.kind === 'expression') {
            let maxChildDepth = -1;
            if (node.kind === 'expression') {
                for (const arg of node.args) {
                    if (arg !== null) {
                        const childDepth = traverse(arg, nestingDepth);
                        if (childDepth > maxChildDepth) {
                            maxChildDepth = childDepth;
                        }
                    }
                }
            }
            const myDepth = maxChildDepth + 1;

            const bucket = argsByDepth.get(myDepth) ?? [];
            bucket.push(node);
            argsByDepth.set(myDepth, bucket);

            return myDepth;
        }

        if (node.kind === 'statement') {
            // Process arguments of the statement
            for (const arg of node.args) {
                if (arg !== null) {
                    traverse(arg, nestingDepth);
                }
            }

            // Process nested cavity if any (increase nesting depth)
            if (node.nestedNext !== null && node.nestedNext !== undefined) {
                traverse(node.nestedNext, nestingDepth + 1);
            }

            // Process next statement in the sequence (same nesting depth)
            if (node.next !== null) {
                traverse(node.next, nestingDepth);
            }

            const bucket = stmtsByDepth.get(nestingDepth) ?? [];
            bucket.push(node);
            stmtsByDepth.set(nestingDepth, bucket);

            return 0;
        }

        return 0;
    }

    // Start traversal from the root. The root is at nesting depth 0.
    traverse(root, 0);

    // Yield arguments from highest depth (leaves, depth 0) down to top-level args
    const argDepths = Array.from(argsByDepth.keys()).sort((a, b) => a - b);
    for (const depth of argDepths) {
        if (argsByDepth.get(depth)!.length > 0) {
            yield argsByDepth.get(depth)!;
        }
    }

    // Yield statements from highest nesting depth (innermost cavities) down to 0 (main chain)
    const stmtDepths = Array.from(stmtsByDepth.keys()).sort((a, b) => b - a);
    for (const depth of stmtDepths) {
        if (stmtsByDepth.get(depth)!.length > 0) {
            yield stmtsByDepth.get(depth)!;
        }
    }
}
