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

        if (type === 'top-bottom' || type === 'right-left') {
            toNode.parent = fromNode;
        } else if (type === 'left-right') {
            fromNode.parent = toNode;
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

        // Helper to recursively gather all descendants
        const gatherDescendants = (n: ITowerNode, collection: Map<string, ITowerNode>) => {
            collection.set(n.brick.uuid, cloneDeep(n));
            this.nodes.forEach(childNode => {
                if (childNode.parent && childNode.parent.brick.uuid === n.brick.uuid) {
                    gatherDescendants(childNode, collection);
                }
            });
        };

        const newNodes = new Map<string, ITowerNode>();
        gatherDescendants(node, newNodes);

        // Disconnect the subtree from the original tower
        if (node.parent) {
            // Remove connections involving the detached subtree
            this.connections = this.connections.filter(
                (conn) => {
                    // Keep connections that don't involve any node in the detached subtree
                    const fromInSubtree = newNodes.has(conn.from);
                    const toInSubtree = newNodes.has(conn.to);
                    return !(fromInSubtree || toInSubtree);
                }
            );
        }

        // Remove nodes from the original tower
        for (const key of newNodes.keys()) {
            this.nodes.delete(key);
        }

        // The new tower's nodes are the collected descendants
        newTower.nodes.clear(); // Clear the root created by the constructor
        newNodes.forEach((n, id) => {
            // Reset parent for the root of the new tower
            if (id === brickId) {
                n.parent = null;
            }
            newTower.nodes.set(id, n);
        });

        // Copy relevant connections to the new tower
        const detachedConnections = this.connections.filter(conn => 
            newNodes.has(conn.from) && newNodes.has(conn.to)
        );
        newTower.connections = detachedConnections;

        return newTower;
    }
}
