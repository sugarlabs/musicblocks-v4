/**
 * Brick Collision Service
 * Main service for managing collision detection and connection state
 */

import type { IBrick } from '../../@types/brick';
import type { TPoint } from '../../@types/tower';
import type { CollisionResult, ConnectionState, CollisionConfig, TowerNode } from '../types';
import { CollisionDetector } from './CollisionDetector';
import { DEFAULT_COLLISION_CONFIG } from '../types';

export class BrickCollisionService {
    private detector: CollisionDetector;
    private brickRegistry: Map<string, IBrick> = new Map();
    private connectionMap: Map<string, ConnectionState> = new Map();
    private collisionCache: Map<string, CollisionResult[]> = new Map();
    private config: CollisionConfig;

    constructor(workspaceWidth: number, workspaceHeight: number, config?: Partial<CollisionConfig>) {
        this.config = { ...DEFAULT_COLLISION_CONFIG, ...config };
        this.detector = new CollisionDetector(workspaceWidth, workspaceHeight, this.config);
    }

    /**
     * Register a brick with the collision detection system
     */
    registerBrick(brick: IBrick): void {
        this.brickRegistry.set(brick.uuid, brick);
        this.collisionCache.delete(brick.uuid);
    }

    /**
     * Unregister a brick from the collision detection system
     */
    unregisterBrick(brickId: string): void {
        this.brickRegistry.delete(brickId);
        this.collisionCache.delete(brickId);
        this.removeBrickConnections(brickId);
    }

    /**
     * Get all registered bricks
     */
    getAllBricks(): IBrick[] {
        return Array.from(this.brickRegistry.values());
    }

    /**
     * Get collision detection results for a specific brick
     */
    getBrickCollisions(brickId: string): CollisionResult[] {
        if (!this.collisionCache.has(brickId)) {
            const allBricks = this.getAllBricks();
            const collisions = this.detector.detectCollisions(allBricks, brickId);
            this.collisionCache.set(brickId, collisions);
        }
        return this.collisionCache.get(brickId) || [];
    }

    /**
     * Get all collision detection results
     */
    getAllCollisions(): CollisionResult[] {
        const allBricks = this.getAllBricks();
        return this.detector.detectCollisions(allBricks);
    }

    /**
     * Establish a connection between two connection points
     */
    establishConnection(sourceId: string, targetId: string): boolean {
        const connectionId = `${sourceId}-${targetId}`;
        
        if (this.connectionMap.has(connectionId)) {
            return false; // Connection already exists
        }

        const sourceBrickId = this.parseConnectionPointId(sourceId).brickId;
        const targetBrickId = this.parseConnectionPointId(targetId).brickId;

        const connectionState: ConnectionState = {
            sourceBrickId,
            targetBrickId,
            sourceConnectionId: sourceId,
            targetConnectionId: targetId,
            connectionType: 'simple_to_simple', // Default type
            isActive: true,
            establishedAt: Date.now()
        };

        this.connectionMap.set(connectionId, connectionState);
        return true;
    }

    /**
     * Break a connection between two connection points
     */
    breakConnection(connectionId: string): boolean {
        return this.connectionMap.delete(connectionId);
    }

    /**
     * Get all active connections
     */
    getConnections(): Map<string, ConnectionState> {
        return new Map(this.connectionMap);
    }

    /**
     * Update brick position and recalculate collisions
     */
    updateBrickPosition(brickId: string, x: number, y: number): void {
        const brick = this.brickRegistry.get(brickId);
        if (!brick) return;

        this.updateBrickCollisions(brickId);
    }

    /**
     * Update brick position using TPoint and recalculate collisions
     */
    updateBrickPositionWithPoint(brickId: string, position: TPoint): void {
        const brick = this.brickRegistry.get(brickId);
        if (!brick) return;

        this.updateBrickCollisions(brickId);
    }

    /**
     * Set brick positions from a tower model
     */
    setBrickPositionsFromTower(towerNodes: TowerNode[]): void {
        const positions = new Map<string, TPoint>();
        towerNodes.forEach(node => {
            positions.set(node.brick.uuid, node.position);
        });
        
        this.updateBrickPositions(positions);
    }

    /**
     * Update positions for multiple bricks at once
     */
    updateBrickPositions(positions: Map<string, TPoint>): void {
        const connectionExtractor = this.detector.getConnectionExtractor();
        connectionExtractor.setBrickPositions(positions);
        
        this.recalculateAllCollisions();
    }

    /**
     * Get current configuration
     */
    getConfig(): CollisionConfig {
        return { ...this.config };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<CollisionConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.detector.updateConfig(this.config);
        this.recalculateAllCollisions();
    }

    /**
     * Update collision detection for a specific brick
     */
    private updateBrickCollisions(brickId: string): void {
        const brick = this.brickRegistry.get(brickId);
        if (!brick) return;

        const allBricks = this.getAllBricks();
        const collisions = this.detector.detectCollisions(allBricks, brickId);
        this.collisionCache.set(brickId, collisions);
    }

    /**
     * Recalculate collisions for all bricks
     */
    private recalculateAllCollisions(): void {
        this.collisionCache.clear();
        const allBricks = this.getAllBricks();
        this.detector.detectCollisions(allBricks);
    }

    /**
     * Remove all connections involving a specific brick
     */
    private removeBrickConnections(brickId: string): void {
        const connectionsToRemove: string[] = [];
        
        for (const [connectionId, connection] of this.connectionMap) {
            if (connection.sourceBrickId === brickId || connection.targetBrickId === brickId) {
                connectionsToRemove.push(connectionId);
            }
        }
        
        connectionsToRemove.forEach(connectionId => {
            this.connectionMap.delete(connectionId);
        });
    }

    /**
     * Parse connection point ID to extract brick ID and connection info
     */
    private parseConnectionPointId(connectionPointId: string): { brickId: string; side: string; index?: number } {
        const parts = connectionPointId.split(':');
        const brickId = parts[0];
        const side = parts[1];
        const index = parts[2] ? parseInt(parts[2]) : undefined;
        
        return { brickId, side, index };
    }
} 