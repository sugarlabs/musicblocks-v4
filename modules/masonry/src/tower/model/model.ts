import type { IBrick } from '../../@types/brick';
import type {
    TPoint,
    TNotchType,
    TBrickConnection,
    TConnectionValidation,
} from '../../@types/tower';

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
     * Detach a subtree starting from `brickId`, returning a **new** `TowerModel`.
     */
    detachSubTree(
        brickId: string,
        newTowerId: string,
    ): {
        detachedTower: TowerModel;
        removedConnections: TBrickConnection[];
    } {
        const startNode = this.nodes.get(brickId);
        if (!startNode) throw new Error('Brick not found in tower');

        // collect all nodes in the subtree (DFS)
        const nodesToMove = new Map<string, ITowerNode>();
        const stack: ITowerNode[] = [startNode];
        while (stack.length) {
            const n = stack.pop()!;
            nodesToMove.set(n.brick.uuid, n);
            this.nodes.forEach((child) => {
                if (child.parent?.brick.uuid === n.brick.uuid) stack.push(child);
            });
        }

        // create the new tower
        const rootPos = { ...startNode.position };
        const detached = new TowerModel(newTowerId, startNode.brick, rootPos);

        nodesToMove.forEach((node, id) => {
            if (id === brickId) return; // root already exists in detached
            detached.nodes.set(id, node);
        });

        // move / prune connections
        const removedConnections: TBrickConnection[] = [];
        this.connections = this.connections.filter((conn) => {
            const inSubtree = nodesToMove.has(conn.from) && nodesToMove.has(conn.to);
            if (inSubtree) {
                detached.connections.push(conn);
                return false; // remove from original tower
            }
            const touchesSubtree = nodesToMove.has(conn.from) || nodesToMove.has(conn.to);
            if (touchesSubtree) removedConnections.push(conn);
            return !touchesSubtree;
        });

        // finally delete nodes from original tower
        nodesToMove.forEach((_, id) => this.nodes.delete(id));

        return { detachedTower: detached, removedConnections };
    }
}
