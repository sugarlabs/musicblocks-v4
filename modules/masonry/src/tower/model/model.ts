import type { IBrick } from '../../@types/brick';
import type {
    TPoint,
    TNotchType,
    TBrickConnection,
    TConnectionValidation,
} from '../../@types/tower';
import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash.clonedeep';

/**
 * Public representation of a node inside a tower.
 */
export interface ITowerNode {
    brick: IBrick;
    position: TPoint;
    parent: ITowerNode | null;
    connectedNotches: Set<string>;
    isNested?: boolean;
    argIndex?: number;
}

/**
 * A Tower represents one connected graph / stack of bricks.
 */
export default class TowerModel {
    readonly id: string;

    // Internal graph data
    private readonly nodes = new Map<string, ITowerNode>();
    private connections: TBrickConnection[] = [];

    constructor(id: string, rootBrick: IBrick, position: TPoint) {
        this.id = id;
        const rootNode: ITowerNode = {
            brick: rootBrick,
            position,
            parent: null,
            connectedNotches: new Set(),
        };
        this.nodes.set(rootBrick.uuid, rootNode);
    }

    /** All bricks currently in this tower */
    get bricks(): IBrick[] {
        return Array.from(this.nodes.values()).map((n) => n.brick);
    }

    /** All physical connections inside this tower */
    get allConnections(): readonly TBrickConnection[] {
        return this.connections;
    }

    clone(): TowerModel {
      const newTower = new TowerModel(this.id, this.bricks[0], { x: 0, y: 0 }); // Temp root
      newTower.nodes.clear(); // Clear initial root
  
      // Deep copy nodes and connections
      this.nodes.forEach((node, id) => {
        newTower.nodes.set(id, cloneDeep(node));
      });
      newTower.connections = cloneDeep(this.connections);
  
      return newTower;
    }

    hasBrick(brickId: string): boolean {
        return this.nodes.has(brickId);
    }

    /** Direct accessors guarded by readonly wrappers */
    getNode(brickId: string): ITowerNode | undefined {
        return this.nodes.get(brickId);
    }

    nodesArray(): ITowerNode[] {
        return Array.from(this.nodes.values());
    }

    /** Position helpers */
    getBrickPosition(brickId: string): TPoint | undefined {
        return this.nodes.get(brickId)?.position;
    }
    setBrickPosition(brickId: string, pos: TPoint): void {
        const node = this.nodes.get(brickId);
        if (node) node.position = pos;
    }

    /**
     * Add a child brick under an existing parent brick inside this tower.
     */
    addBrick(parentId: string, brick: IBrick, position: TPoint): void {
        const parentNode = this.nodes.get(parentId);
        if (!parentNode) throw new Error('Parent brick not found in tower');

        const node: ITowerNode = {
            brick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
        };
        this.nodes.set(brick.uuid, node);
    }

    /**
     * Add an argument brick to a parent brick at a specific argument slot.
     */
    addArgumentBrick(parentId: string, brick: IBrick, position: TPoint, argIndex?: number): void {
        const parentNode = this.nodes.get(parentId);
        if (!parentNode) throw new Error('Parent brick not found in tower');

        const node: ITowerNode = {
            brick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
            argIndex,
        };
        this.nodes.set(brick.uuid, node);
    }

    /**
     * Add a nested brick inside a compound brick.
     */
    addNestedBrick(parentId: string, brick: IBrick, position: TPoint): void {
        const parentNode = this.nodes.get(parentId);
        if (!parentNode) throw new Error('Parent brick not found in tower');

        const node: ITowerNode = {
            brick,
            position,
            parent: parentNode,
            connectedNotches: new Set(),
            isNested: true,
        };
        this.nodes.set(brick.uuid, node);
    }

    /**
     * Connect two bricks inside this tower.
     */
    connectBricks(
        fromBrickId: string,
        toBrickId: string,
        fromNotchId: string,
        toNotchId: string,
        type: TNotchType,
    ): TConnectionValidation {
        const fromNode = this.nodes.get(fromBrickId);
        const toNode = this.nodes.get(toBrickId);
        if (!fromNode || !toNode) return { isValid: false, reason: 'Brick(s) not in this tower' };

        if (fromNode.connectedNotches.has(fromNotchId) || toNode.connectedNotches.has(toNotchId)) {
            return { isValid: false, reason: 'One or both notches already connected' };
        }

        fromNode.connectedNotches.add(fromNotchId);
        toNode.connectedNotches.add(toNotchId);

        this.connections.push({
            from: fromBrickId,
            to: toBrickId,
            fromNotchId,
            toNotchId,
            type,
        });

        // fromNode is always the parent in a connection!
        toNode.parent = fromNode;
        if (type === 'nested') {
            toNode.isNested = true;
        } else if (type === 'left-right') {
            toNode.argIndex = parseInt(fromNotchId.replace('arg_', '').replace('right_', ''), 10) || 0;
        }

        return { isValid: true };
    }

    /**
     * Merge all nodes & connections from `other` into this tower.
     * Duplicates (by brick uuid) are ignored.
     */
    mergeIn(other: TowerModel): void {
        other.nodes.forEach((node, id) => {
            if (!this.nodes.has(id)) {
                this.nodes.set(id, node);
            }
        });

        // Avoid pushing duplicate connections
        const existing = new Set(this.connections.map((c) => JSON.stringify(c)));
        other.allConnections.forEach((c) => {
            const key = JSON.stringify(c);
            if (!existing.has(key)) this.connections.push(c);
        });
    }

    /**
     * Detach a subtree starting from `brickId`, returning a **new** `TowerModel`
     */
    detachSubtree(brickId: string): TowerModel | null {
        const node = this.nodes.get(brickId);
        if (!node || node.parent === null) return null; // Don't detach root

        // Create a new tower for the detached subtree
        const newTower = new TowerModel(uuid(), node.brick, { ...node.position });

        // Helper to recursively gather all descendants, respecting isNested
        const gatherDescendants = (n: ITowerNode, collection: Map<string, ITowerNode>): void => {
            collection.set(n.brick.uuid, cloneDeep(n));
            // Find all children (nested, args, or stacked) based on parent reference
            this.nodes.forEach(childNode => {
                if (childNode.parent?.brick.uuid === n.brick.uuid) {
                    gatherDescendants(childNode, collection);
                }
            });
        };

        const newNodes = new Map<string, ITowerNode>();
        gatherDescendants(node, newNodes);

        const keptConnections: typeof this.connections = [];
        const detachedConnections: typeof this.connections = [];

        // Partition the connections
        for (const conn of this.connections) {
            const fromInSubtree = newNodes.has(conn.from);
            const toInSubtree = newNodes.has(conn.to);

            if (fromInSubtree && toInSubtree) {
                // Connection moves entirely to the new tower
                detachedConnections.push(conn);
            } else if (!fromInSubtree && !toInSubtree) {
                // Connection stays entirely in the old tower
                keptConnections.push(conn);
            } else {
                // Boundary connection - it is broken! Free up the notches.
                // Remove from the original tower nodes
                const fromNode = this.nodes.get(conn.from);
                const toNode = this.nodes.get(conn.to);
                if (fromNode) fromNode.connectedNotches.delete(conn.fromNotchId);
                if (toNode) toNode.connectedNotches.delete(conn.toNotchId);

                // Also remove from the cloned new nodes (the detached tower)
                const fromNew = newNodes.get(conn.from);
                const toNew = newNodes.get(conn.to);
                if (fromNew) fromNew.connectedNotches.delete(conn.fromNotchId);
                if (toNew) toNew.connectedNotches.delete(conn.toNotchId);
            }
        }
        
        this.connections = keptConnections;

        // Remove nodes from the original tower
        for (const key of newNodes.keys()) {
            this.nodes.delete(key);
        }

        // Set up the new tower's nodes, adjusting parents
        newTower.nodes.clear(); // Clear the root created by the constructor
        newNodes.forEach((n, id) => {
            const newNode = cloneDeep(n);
            // Reset parent for the root of the new tower
            if (id === brickId) {
                newNode.parent = null;
            } else {
                // Re-link parent if it exists in the new tower
                if (n.parent) {
                    const parentNode = newNodes.get(n.parent.brick.uuid);
                    newNode.parent = parentNode || null; // Safe assignment with type guard
                } else {
                    newNode.parent = null; // Explicitly handle null parent
                }
            }
            newTower.nodes.set(id, newNode);
        });

        // Copy relevant connections to the new tower
        newTower.connections = detachedConnections;

        return newTower;
    }

    /**
     * Helper to retrieve organized children for a brick.
     * Mirrors the logic from TowerView.
     */
    private getChildrenOf(brickId: string) {
        const nested: ITowerNode[] = [];
        const args: ITowerNode[] = [];
        const stacked: ITowerNode[] = [];

        this.nodes.forEach(node => {
            if (node.parent?.brick.uuid === brickId) {
                if (node.isNested) nested.push(node);
                else if (node.argIndex !== undefined) args.push(node);
                else stacked.push(node);
            }
        });

        // Ensure deterministic order based on current Y (approx) or ID. 
        // In reality, order may depend on insertion array but Y usually works for rendering.
        nested.sort((a, b) => a.position.y - b.position.y);
        args.sort((a, b) => (a.argIndex ?? 0) - (b.argIndex ?? 0));
        stacked.sort((a, b) => a.position.y - b.position.y);

        return { nested, args, stacked };
    }

    /**
     * Sync physical `position` of all nodes using bounding box extents and connection points.
     * Call this whenever the tower moves or its structure changes.
     */
    private syncLayoutRecursive(node: ITowerNode, x: number, y: number) {
        node.position = { x, y };
        const children = this.getChildrenOf(node.brick.uuid);

        // Nested children
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cp = (node.brick as any).connectionPoints;

        if (children.nested.length > 0 && cp?.nested) {
            let nestedOffsetY = 0;
            children.nested.forEach(child => {
                const nestedX = x + (cp.nested.x || 0);
                const nestedY = y + (cp.nested.y || 0) + nestedOffsetY;
                this.syncLayoutRecursive(child, nestedX, nestedY);
                nestedOffsetY += child.brick.boundingBox?.h || 0;
            });
        }

        // Argument children
        if (children.args.length > 0 && cp?.args) {
            children.args.forEach(child => {
                const argIndex = child.argIndex || 0;
                if (argIndex < cp.args.length) {
                    const argOrigin = cp.args[argIndex];
                    this.syncLayoutRecursive(child, x + (argOrigin.x || 0), y + (argOrigin.y || 0));
                }
            });
        }

        // Stacked children
        if (children.stacked.length > 0) {
            let stackedOffsetY = y + (node.brick.boundingBox?.h || 0);
            children.stacked.forEach(child => {
                this.syncLayoutRecursive(child, x, stackedOffsetY);
                stackedOffsetY += child.brick.boundingBox?.h || 0;
            });
        }

        // Nested under simple brick (fallback for unstructured logic)
        if (node.brick.type === 'Simple' && children.nested.length > 0) {
            let nestedOffsetY = y + (node.brick.boundingBox?.h || 0);
            children.nested.forEach(child => {
                this.syncLayoutRecursive(child, x, nestedOffsetY);
                nestedOffsetY += child.brick.boundingBox?.h || 0;
            });
        }
    }

    /** Recalculate coordinates for all nodes in the tower */
    public syncLayout() {
        const root = Array.from(this.nodes.values()).find(n => !n.parent);
        if (root) {
            this.syncLayoutRecursive(root, root.position.x, root.position.y);
        }
    }

    /**
     * Returns absolute world-space coordinates for every **unconnected** notch
     * in this tower.  The result feeds directly into `QuadTreeIndex.insertAll()`.
     */
    getAbsoluteNotches(): import('../../collision-detection/QuadTreeIndex').INotchIndex[] {
        this.syncLayout(); // Ensure nodes have correct absolute layout before exporting!
        const notches: import('../../collision-detection/QuadTreeIndex').INotchIndex[] = [];

        this.nodes.forEach((node, brickId) => {
            // connectionPoints comes from generateBrickData() and lives on every BrickModel
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cp = (node.brick as any).connectionPoints;
            const px = node.position.x;
            const py = node.position.y;

            // ── Instruction notches (simple & compound bricks) ──
            if (cp?.top && !node.connectedNotches.has('top')) {
                notches.push({
                    notchId: 'top',
                    brickId,
                    towerId: this.id,
                    worldPosition: { x: px + cp.top.x, y: py + cp.top.y },
                    notchType: 'insTop',
                });
            }
            if (cp?.bottom && !node.connectedNotches.has('bottom')) {
                notches.push({
                    notchId: 'bottom',
                    brickId,
                    towerId: this.id,
                    worldPosition: { x: px + cp.bottom.x, y: py + cp.bottom.y },
                    notchType: 'insBot',
                });
            }

            // ── Expression brick left notch ──
            if (cp?.left && !node.connectedNotches.has('left')) {
                notches.push({
                    notchId: 'left',
                    brickId,
                    towerId: this.id,
                    worldPosition: { x: px + cp.left.x, y: py + cp.left.y },
                    notchType: 'argLeft',
                });
            }

            // ── Argument slots on instruction / compound bricks ──
            if (cp?.args && Array.isArray(cp.args)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cp.args.forEach((pt: any, i: number) => {
                    const nId = `arg_${i}`;
                    if (!node.connectedNotches.has(nId)) {
                        notches.push({
                            notchId: nId,
                            brickId,
                            towerId: this.id,
                            worldPosition: { x: px + pt.x, y: py + pt.y },
                            notchType: 'argRight',
                        });
                    }
                });
            } else if (cp?.right && Array.isArray(cp.right)) {
                // Fallback: some bricks expose `right` directly
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cp.right.forEach((pt: any, i: number) => {
                    const nId = `right_${i}`;
                    if (!node.connectedNotches.has(nId)) {
                        notches.push({
                            notchId: nId,
                            brickId,
                            towerId: this.id,
                            worldPosition: { x: px + pt.x, y: py + pt.y },
                            notchType: 'argRight',
                        });
                    }
                });
            }

            // ── Nested region (compound bricks) ──
            if (cp?.nested && !node.connectedNotches.has('nested')) {
                notches.push({
                    notchId: 'nested',
                    brickId,
                    towerId: this.id,
                    worldPosition: { x: px + cp.nested.x, y: py + cp.nested.y },
                    notchType: 'insNestTop',
                });
            }
        });

        return notches;
    }
}
