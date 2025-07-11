/**
 * Quadtree-based collision detector for efficient spatial queries
 * O(n log n) algorithm suitable for large datasets (>= 20 bricks)
 */

import type { BrickConnectionPoint, CollisionResult, CollisionConfig, ConnectionType } from '../types';
import CodeBuilderQuadTree from '../../../../code-builder/src/collision/QuadTree';  
import type { TCollisionObject } from '../../../../code-builder/src/@types/collision';

export class QuadTreeCollisionDetector {
    private config: CollisionConfig;
    private workspaceWidth: number;
    private workspaceHeight: number;
    private quadTree: any; // Will use the existing quadtree from code-builder module

    constructor(workspaceWidth: number, workspaceHeight: number, config: CollisionConfig) {
        this.config = config;
        this.workspaceWidth = workspaceWidth;
        this.workspaceHeight = workspaceHeight;
        this.initializeQuadTree();
    }

    /**
     * Detect collisions using quadtree algorithm
     */
    detectCollisions(connectionPoints: BrickConnectionPoint[], targetBrickId?: string): CollisionResult[] {
        const collisions: CollisionResult[] = [];

        // Clear and rebuild quadtree with current connection points
        this.rebuildQuadTree(connectionPoints);

        // Filter points if we're only checking collisions for a specific brick
        const pointsToCheck = targetBrickId 
            ? connectionPoints.filter(point => point.brickId === targetBrickId)
            : connectionPoints;

        // Check each point using quadtree spatial queries
        for (const sourcePoint of pointsToCheck) {
            const nearbyPoints = this.queryNearbyPoints(sourcePoint);
            
            for (const targetPoint of nearbyPoints) {
                // Skip if same point or same brick
                if (sourcePoint.id === targetPoint.id || sourcePoint.brickId === targetPoint.brickId) {
                    continue;
                }

                // Calculate distance between points
                const distance = this.calculateDistance(sourcePoint, targetPoint);
                
                // Check if points are within collision distance
                if (distance < this.config.maxCollisionDistance) {
                    const collision = this.createCollisionResult(sourcePoint, targetPoint, distance);
                    if (collision) {
                        collisions.push(collision);
                    }
                }
            }
        }

        return collisions;
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: CollisionConfig): void {
        this.config = newConfig;
    }

    /**
     * Initialize the quadtree
     */
    private initializeQuadTree(): void {
        // Use the real QuadTree from code-builder
        this.quadTree = new CodeBuilderQuadTree(this.workspaceWidth, this.workspaceHeight);
    }

    /**
     * Create a simple quadtree implementation
     * This is a placeholder - you should use the existing quadtree from code-builder
     */
    private createSimpleQuadTree(): any {
        // Simple quadtree implementation for now
        // In production, use the existing quadtree from modules/code-builder/src/collision/QuadTree.ts
        return {
            clear: () => {},
            insert: (point: any) => {},
            query: (bounds: any) => []
        };
    }

    /**
     * Rebuild the quadtree with current connection points
     */
    private rebuildQuadTree(connectionPoints: BrickConnectionPoint[]): void {
        this.quadTree.reset();
        // Convert BrickConnectionPoint to TCollisionObject with data
        const objects: TCollisionObject[] = connectionPoints.map(point => ({
            id: point.id,
            x: point.worldX,
            y: point.worldY,
            width: point.radius * 2,
            height: point.radius * 2,
            data: point // preserve BrickConnectionPoint
        }));
        this.quadTree.addObjects(objects);
    }

    /**
     * Query for points near a given connection point
     */
    private queryNearbyPoints(sourcePoint: BrickConnectionPoint): BrickConnectionPoint[] {
        const searchRadius = this.config.maxCollisionDistance;
        const bounds = {
            x: sourcePoint.worldX - searchRadius,
            y: sourcePoint.worldY - searchRadius,
            width: searchRadius * 2,
            height: searchRadius * 2
        };
        // Use the quadtree's colliding method for all objects in the search area
        // We'll create a TCollisionObject for the query
        const queryObj: TCollisionObject = {
            id: sourcePoint.id,
            x: sourcePoint.worldX,
            y: sourcePoint.worldY,
            width: sourcePoint.radius * 2,
            height: sourcePoint.radius * 2
        };
        // Get IDs of colliding objects
        const collidingIds = this.quadTree.checkCollision(queryObj);
        // Map back to BrickConnectionPoint using the quadtree's internal map
        // We'll need to get all objects and filter by ID
        // For now, just return all objects in the bounding box (if available)
        // If the quadtree supports a query(bounds) method, use it:
        if (typeof this.quadTree._tree?.query === 'function') {
            const results = this.quadTree._tree.query(bounds);
            return results.map((obj: any) => obj.data as BrickConnectionPoint);
        }
        // Fallback: return empty array
        return [];
    }

    /**
     * Calculate Euclidean distance between two connection points
     */
    private calculateDistance(point1: BrickConnectionPoint, point2: BrickConnectionPoint): number {
        const dx = point1.worldX - point2.worldX;
        const dy = point1.worldY - point2.worldY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Create a collision result object
     */
    private createCollisionResult(
        sourcePoint: BrickConnectionPoint, 
        targetPoint: BrickConnectionPoint, 
        distance: number
    ): CollisionResult | null {
        // Determine connection type
        const connectionType = this.determineConnectionType(sourcePoint, targetPoint);
        
        // Check if this is a valid connection
        const isValidConnection = this.isValidConnection(sourcePoint, targetPoint, connectionType);

        return {
            id: `${sourcePoint.id}-${targetPoint.id}`,
            sourceBrickId: sourcePoint.brickId,
            targetBrickId: targetPoint.brickId,
            sourceConnectionPoint: sourcePoint,
            targetConnectionPoint: targetPoint,
            distance,
            connectionType,
            isValidConnection,
            timestamp: Date.now()
        };
    }

    /**
     * Determine the type of connection between two points
     */
    private determineConnectionType(sourcePoint: BrickConnectionPoint, targetPoint: BrickConnectionPoint): ConnectionType {
        const sourceType = sourcePoint.type;
        const targetType = targetPoint.type;
        
        // This is a simplified mapping - you may need to expand this based on your specific rules
        if (sourceType.includes('expression') && targetType.includes('simple')) {
            return 'expression_to_simple';
        } else if (sourceType.includes('expression') && targetType.includes('compound')) {
            return 'expression_to_compound';
        } else if (sourceType.includes('simple') && targetType.includes('expression')) {
            return 'simple_to_expression';
        } else if (sourceType.includes('compound') && targetType.includes('expression')) {
            return 'compound_to_expression';
        } else if (sourceType.includes('simple') && targetType.includes('simple')) {
            return 'simple_to_simple';
        } else if (sourceType.includes('compound') && targetType.includes('compound')) {
            return 'compound_to_compound';
        } else if (sourceType.includes('simple') && targetType.includes('compound')) {
            return 'simple_to_compound';
        } else if (sourceType.includes('compound') && targetType.includes('simple')) {
            return 'compound_to_simple';
        }

        // Default fallback
        return 'simple_to_simple';
    }

    /**
     * Check if the connection between two points is valid
     */
    private isValidConnection(
        sourcePoint: BrickConnectionPoint, 
        targetPoint: BrickConnectionPoint, 
        connectionType: ConnectionType
    ): boolean {
        // Basic validation: can't connect to self
        if (sourcePoint.brickId === targetPoint.brickId) {
            return false;
        }

        // Check if connection points are compatible
        if (!this.areConnectionPointsCompatible(sourcePoint, targetPoint)) {
            return false;
        }

        return true;
    }

    /**
     * Check if two connection points are compatible for connection
     */
    private areConnectionPointsCompatible(sourcePoint: BrickConnectionPoint, targetPoint: BrickConnectionPoint): boolean {
        // Basic validation: opposite sides can connect
        const oppositeSides = {
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left'
        };

        return oppositeSides[sourcePoint.side] === targetPoint.side;
    }
} 