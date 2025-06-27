import type { IBrick, TBrickType } from '../../brick/@types/brick';

// Point type
export type TPoint = {
    x: number;
    y: number;
};

// Notch type
export type TNotchType = 'top-bottom' | 'right-left' | 'left-right';

// Connection point types
export type TConnectionPoint = {
    x: number;
    y: number;
};

export type TConnectionPoints = {
    top?: TConnectionPoint;
    right: TConnectionPoint[];
    bottom?: TConnectionPoint;
    left?: TConnectionPoint;
    nested?: TConnectionPoint;
    args?: TConnectionPoint[];
};

// Connection types between bricks
export type TConnectionType = 'top-bottom' | 'left-right' | 'right-left' | 'nested';

// Connection between two bricks
export type TBrickConnection = {
    from: string;
    to: string;
    fromNotchId: string;
    toNotchId: string;
    type: TNotchType;
};

// Tree node representing a brick in the tree
// Update the TTreeNode type to include the missing properties
export type TTreeNode = {
    brick: IBrick;
    position: TPoint;
    parent: TTreeNode | null;
    connectedNotches: Set<string>;
    isNested?: boolean;  // Added: indicates if this brick is nested inside its parent
    argIndex?: number;   // Added: indicates which argument slot this brick occupies
};

// Tree structure representing connected bricks
export type TTree = {
    id: string;
    nodes: Map<string, TTreeNode>;
    connections: TBrickConnection[];
};

// Connection validation result
export type TConnectionValidation = {
    isValid: boolean;
    reason?: string;
};

// Main tree manager class
export default class BrickTreeManager {
    private trees: TTree[] = [];
    private nextTreeId = 1;

    constructor() {}

    /**
     * Finds the ID of a notch on a brick based on connection point coordinates.
     * @param brick The brick to search on.
     * @param point The connection point coordinates.
     * @returns The notch ID (e.g., 'left', 'right_0') or null if not found.
     */
    private findNotchId(brick: IBrick, point: TConnectionPoint): string | null {
        const { connectionPoints } = brick;
        const tolerance = 1.5; // Use a slightly larger tolerance

        if (
            connectionPoints.top &&
            Math.hypot(connectionPoints.top.x - point.x, connectionPoints.top.y - point.y) <
                tolerance
        ) {
            return 'top';
        }
        if (
            connectionPoints.bottom &&
            Math.hypot(connectionPoints.bottom.x - point.x, connectionPoints.bottom.y - point.y) <
                tolerance
        ) {
            return 'bottom';
        }
        if (
            connectionPoints.left &&
            Math.hypot(connectionPoints.left.x - point.x, connectionPoints.left.y - point.y) <
                tolerance
        ) {
            return 'left';
        }
        for (let i = 0; i < connectionPoints.right.length; i++) {
            const rightPoint = connectionPoints.right[i];
            if (Math.hypot(rightPoint.x - point.x, rightPoint.y - point.y) < tolerance) {
                return `right_${i}`;
            }
        }
        return null;
    }

    /**
     * Creates a new tree with a single brick
     */
    public createTree(brick: IBrick, position: TPoint): TTree {
        const treeId = `tree_${this.nextTreeId++}`;
        const node: TTreeNode = {
            brick,
            position,
            parent: null,
            connectedNotches: new Set(),
        };
        const tree: TTree = {
            id: treeId,
            nodes: new Map([[brick.uuid, node]]),
            connections: [],
        };
        this.trees.push(tree);
        return tree;
    }

    /**
     * Adds a brick to an existing tree
     */
    public addBrickToTree(treeId: string, brick: IBrick, parentBrickId: string, position: TPoint) {
        const tree = this.trees.find((t) => t.id === treeId);
        if (!tree) return;

        const parentNode = tree.nodes.get(parentBrickId);
        if (!parentNode) return;

        const node: TTreeNode = {
            brick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
        };
        tree.nodes.set(brick.uuid, node);
    }

    /**
     * Connects two trees or bricks with validation
     */
    public connectBricks(
        fromBrickId: string,
        toBrickId: string,
        fromPoint: TConnectionPoint,
        toPoint: TConnectionPoint,
        connectionType: TNotchType,
    ): string | null {
        const fromBrickNode = this.getBrickNode(fromBrickId);
        const toBrickNode = this.getBrickNode(toBrickId);

        if (!fromBrickNode || !toBrickNode) return null;

        console.log(`Connection points - fromPoint:`, fromPoint, `toPoint:`, toPoint);
        console.log(`From brick connection points:`, fromBrickNode.brick.connectionPoints);
        console.log(`To brick connection points:`, toBrickNode.brick.connectionPoints);

        const fromNotchId = this.findNotchId(fromBrickNode.brick, fromPoint);
        const toNotchId = this.findNotchId(toBrickNode.brick, toPoint);

        console.log(
            `Connecting ${fromBrickId} to ${toBrickId}: fromNotchId=${fromNotchId}, toNotchId=${toNotchId}`,
        );

        if (!fromNotchId || !toNotchId) {
            console.error('Could not determine notch IDs for connection');
            return null;
        }

        console.log(`From brick connected notches:`, Array.from(fromBrickNode.connectedNotches));
        console.log(`To brick connected notches:`, Array.from(toBrickNode.connectedNotches));

        if (
            fromBrickNode.connectedNotches.has(fromNotchId) ||
            toBrickNode.connectedNotches.has(toNotchId)
        ) {
            console.error('One or both notches are already connected');
            return null;
        }

        fromBrickNode.connectedNotches.add(fromNotchId);
        toBrickNode.connectedNotches.add(toNotchId);

        const fromTree = this.findTreeByBrickId(fromBrickId);
        const toTree = this.findTreeByBrickId(toBrickId);

        if (!fromTree || !toTree) return null;

        const connection: TBrickConnection = {
            from: fromBrickId,
            to: toBrickId,
            fromNotchId,
            toNotchId,
            type: connectionType,
        };

        if (fromTree.id === toTree.id) {
            fromTree.connections.push(connection);
            this.updateParentChildRelationships(fromBrickId, toBrickId, connection.type);
            console.log(`Added connection to existing tree ${fromTree.id}`);
            return fromTree.id;
        }

        const mergedTree = this.mergeTrees(fromTree, toTree, connection);
        this.updateParentChildRelationships(fromBrickId, toBrickId, connection.type);
        console.log(`Merged trees into ${mergedTree.id}`);
        return mergedTree.id;
    }

    private mergeTrees(tree1: TTree, tree2: TTree, connection: TBrickConnection): TTree {
        tree2.nodes.forEach((node, brickId) => {
            tree1.nodes.set(brickId, node);
        });
        tree2.connections.forEach((conn) => {
            tree1.connections.push(conn);
        });
        tree1.connections.push(connection);
        this.trees = this.trees.filter((t) => t.id !== tree2.id);
        return tree1;
    }

    /**
     * Updates parent-child relationships based on connection type
     */
    private updateParentChildRelationships(
        fromBrickId: string,
        toBrickId: string,
        notchType: TNotchType,
    ) {
        const fromNode = this.getBrickNode(fromBrickId);
        const toNode = this.getBrickNode(toBrickId);
        if (!fromNode || !toNode) return;

        if (notchType === 'top-bottom' || notchType === 'right-left') {
            toNode.parent = fromNode;
        } else if (notchType === 'left-right') {
            fromNode.parent = toNode;
        }
    }

    /**
     * Disconnects a brick from its tree
     * Handles hierarchical relationships like a folder structure:
     * - If disconnecting a parent, all children remain connected to it
     * - If disconnecting a child, it becomes a separate tree
     */
    public disconnectBrick(brickId: string): {
        removedConnections: TBrickConnection[];
        newTreeIds: string[];
    } {
        const brickNode = this.getBrickNode(brickId);
        if (!brickNode) return { removedConnections: [], newTreeIds: [] };

        const originalTree = this.findTreeByBrickId(brickId);
        if (!originalTree) return { removedConnections: [], newTreeIds: [] };

        console.log(`Disconnecting brick ${brickId} from tree ${originalTree.id}`);
        console.log(`Original tree connections:`, originalTree.connections);

        // Collect all descendant nodes of the disconnected brick (including the brick itself)
        const nodesToMove = new Map<string, TTreeNode>();
        const stack: TTreeNode[] = [brickNode];
        const visited = new Set<string>([brickNode.brick.uuid]);

        while (stack.length > 0) {
            const currentNode = stack.pop()!;
            nodesToMove.set(currentNode.brick.uuid, currentNode);

            // Add all children of the current node to the stack for processing
            this.getBrickChildren(currentNode.brick.uuid).forEach((child) => {
                if (!visited.has(child.brick.uuid)) {
                    visited.add(child.brick.uuid);
                    stack.push(child);
                }
            });
        }

        console.log(`Nodes to move:`, Array.from(nodesToMove.keys()));

        // Find all connections that need to be removed from the original tree
        // This includes connections between nodes being moved and connections to/from external nodes
        const connectionsToRemove = originalTree.connections.filter((conn) => {
            const fromInNewTree = nodesToMove.has(conn.from);
            const toInNewTree = nodesToMove.has(conn.to);

            // Remove connections where both nodes are moving to the new tree
            // OR connections where one node is moving and the other stays in original tree
            const shouldRemove =
                (fromInNewTree && toInNewTree) ||
                (fromInNewTree && !toInNewTree) ||
                (!fromInNewTree && toInNewTree);

            console.log(
                `Connection ${conn.from} -> ${conn.to}: fromInNewTree=${fromInNewTree}, toInNewTree=${toInNewTree}, shouldRemove=${shouldRemove}`,
            );

            return shouldRemove;
        });

        console.log(`Connections to remove:`, connectionsToRemove);

        if (connectionsToRemove.length === 0) return { removedConnections: [], newTreeIds: [] };

        // Remove connections from original tree
        this.removeConnections(originalTree, connectionsToRemove);

        // Remove nodes from original tree
        nodesToMove.forEach((node, brickId) => {
            originalTree.nodes.delete(brickId);
        });

        // Create new tree with the disconnected brick as root
        const newTree = this.createTree(brickNode.brick, brickNode.position);

        // Add all descendant nodes to the new tree
        nodesToMove.forEach((node, brickId) => {
            if (brickId !== brickNode.brick.uuid) {
                // Don't add the root twice
                newTree.nodes.set(brickId, node);
            }
        });

        // Move connections between nodes in the new tree to the new tree
        const connectionsToMove = connectionsToRemove.filter(
            (conn) => nodesToMove.has(conn.from) && nodesToMove.has(conn.to),
        );
        newTree.connections = connectionsToMove;

        // Update parent relationships for the new tree
        // The disconnected brick becomes the root (no parent)
        brickNode.parent = null;

        // All other nodes in the new tree should have their parent relationships preserved
        // but only if their parent is also in the new tree
        nodesToMove.forEach((node, brickId) => {
            if (brickId !== brickNode.brick.uuid && node.parent) {
                if (!nodesToMove.has(node.parent.brick.uuid)) {
                    // If parent is not in the new tree, this node becomes a direct child of the root
                    node.parent = brickNode;
                }
            }
        });

        // Clean up original tree if it's empty
        if (originalTree.nodes.size === 0) {
            this.trees = this.trees.filter((t) => t.id !== originalTree.id);
        }

        console.log(`Returning ${connectionsToRemove.length} removed connections`);
        return { removedConnections: connectionsToRemove, newTreeIds: [newTree.id] };
    }

    private removeConnections(tree: TTree, connectionsToRemove: TBrickConnection[]) {
        connectionsToRemove.forEach((conn) => {
            const fromNode = this.getBrickNode(conn.from);
            const toNode = this.getBrickNode(conn.to);
            if (fromNode && conn.fromNotchId) fromNode.connectedNotches.delete(conn.fromNotchId);
            if (toNode && conn.toNotchId) toNode.connectedNotches.delete(conn.toNotchId);
            if (toNode && toNode.parent?.brick.uuid === conn.from) toNode.parent = null;
            if (fromNode && fromNode.parent?.brick.uuid === conn.to) fromNode.parent = null;
        });
        tree.connections = tree.connections.filter((c) => !connectionsToRemove.includes(c));
    }

    /**
     * Gets a tree by ID
     */
    public getTree(treeId: string): TTree | undefined {
        return this.trees.find((t) => t.id === treeId);
    }

    /**
     * Gets all trees
     */
    public getAllTrees(): TTree[] {
        return this.trees;
    }

    /**
     * Gets all brick IDs in a tree
     */
    public getBricksInTree(treeId: string): IBrick[] {
        const tree = this.getTree(treeId);
        return tree ? Array.from(tree.nodes.values()).map((n) => n.brick) : [];
    }

    /**
     * Checks if two bricks are connected
     */
    public areBricksConnected(brickId1: string, brickId2: string): boolean {
        for (const tree of this.trees) {
            if (
                tree.connections.some(
                    (c) =>
                        (c.from === brickId1 && c.to === brickId2) ||
                        (c.from === brickId2 && c.to === brickId1),
                )
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Gets all connections for a brick
     */
    public getBrickConnections(brickId: string): TBrickConnection[] {
        const tree = this.getTree(brickId);
        if (!tree) return [];

        return tree.connections.filter((conn) => conn.from === brickId || conn.to === brickId);
    }

    /**
     * Moves a brick within its tree
     */
    public moveBrick(brickId: string, newPosition: { x: number; y: number }): boolean {
        const tree = this.getTree(brickId);
        if (!tree) return false;

        const node = tree.nodes.get(brickId);
        if (!node) return false;

        node.position = newPosition;

        return true;
    }

    /**
     * Gets the path from root to a specific brick
     */
    public getPathToBrick(brickId: string): string[] {
        const tree = this.getTree(brickId);
        if (!tree) return [];

        const path: string[] = [];
        let currentBrickId = brickId;

        while (currentBrickId) {
            path.unshift(currentBrickId);
            const node = tree.nodes.get(currentBrickId);
            currentBrickId = node?.parent?.brick.uuid || '';
        }

        return path;
    }

    /**
     * Gets all children of a brick
     */
    public getBrickChildren(brickId: string): TTreeNode[] {
        const children: TTreeNode[] = [];
        for (const tree of this.trees) {
            for (const node of tree.nodes.values()) {
                if (node.parent?.brick.uuid === brickId) {
                    children.push(node);
                }
            }
        }
        return children;
    }

    /**
     * Gets the parent of a brick
     */
    public getBrickParent(brickId: string): string | undefined {
        const node = this.getBrickNode(brickId);
        return node?.parent?.brick.uuid;
    }

    /**
     * Clears all trees
     */
    public clear(): void {
        this.trees = [];
        this.nextTreeId = 1;
    }

    private getBrickNode(brickId: string): TTreeNode | undefined {
        for (const tree of this.trees) {
            const node = tree.nodes.get(brickId);
            if (node) return node;
        }
        return undefined;
    }

    private findTreeByBrickId(brickId: string): TTree | undefined {
        return this.trees.find((tree) => tree.nodes.has(brickId));
    }

    public addNestedBrick(
        parentBrickId: string, 
        childBrick: IBrick, 
        position: TPoint
    ): boolean {
        const parentNode = this.getBrickNode(parentBrickId);
        if (!parentNode) return false;

        const tree = this.findTreeByBrickId(parentBrickId);
        if (!tree) return false;

        const childNode: TTreeNode = {
            brick: childBrick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
            isNested: true, // Mark as nested
        };

        tree.nodes.set(childBrick.uuid, childNode);
        return true;
    }

    /**
     * Adds an argument brick to a parent brick at a specific argument index
     */
    public addArgumentBrick(
        parentBrickId: string, 
        childBrick: IBrick, 
        position: TPoint,
        argIndex: number
    ): boolean {
        const parentNode = this.getBrickNode(parentBrickId);
        if (!parentNode) return false;

        const tree = this.findTreeByBrickId(parentBrickId);
        if (!tree) return false;

        // Check if argument slot is available
        if (!parentNode.brick.connectionPoints.args || 
            argIndex >= parentNode.brick.connectionPoints.args.length) {
            return false;
        }

        // Check if this argument slot is already occupied
        const existingArgBrick = this.getArgumentBrick(parentBrickId, argIndex);
        if (existingArgBrick) return false;

        const childNode: TTreeNode = {
            brick: childBrick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
            argIndex, // Mark with argument index
        };

        tree.nodes.set(childBrick.uuid, childNode);
        return true;
    }

    /**
     * Gets the brick occupying a specific argument slot
     */
    public getArgumentBrick(parentBrickId: string, argIndex: number): IBrick | null {
        const tree = this.findTreeByBrickId(parentBrickId);
        if (!tree) return null;

        for (const [_, node] of tree.nodes) {
            if (node.parent?.brick.uuid === parentBrickId && 
                node.argIndex === argIndex) {
                return node.brick;
            }
        }
        return null;
    }

    /**
     * Gets all nested children of a brick
     */
    public getNestedChildren(brickId: string): IBrick[] {
        const children: IBrick[] = [];
        for (const tree of this.trees) {
            for (const node of tree.nodes.values()) {
                if (node.parent?.brick.uuid === brickId && node.isNested) {
                    children.push(node.brick);
                }
            }
        }
        return children;
    }

    /**
     * Gets all argument children of a brick
     */
    public getArgumentChildren(brickId: string): Array<{ brick: IBrick; argIndex: number }> {
        const children: Array<{ brick: IBrick; argIndex: number }> = [];
        for (const tree of this.trees) {
            for (const node of tree.nodes.values()) {
                if (node.parent?.brick.uuid === brickId && 
                    node.argIndex !== undefined && 
                    !node.isNested) {
                    children.push({ brick: node.brick, argIndex: node.argIndex });
                }
            }
        }
        // Sort by argument index
        return children.sort((a, b) => a.argIndex - b.argIndex);
    }
}
