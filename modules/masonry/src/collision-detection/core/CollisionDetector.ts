/**
 * Collision Detector
 * Core collision detection engine with adaptive algorithm selection
 */

import type { IBrick } from '../../@types/brick';
import type { BrickConnectionPoint, CollisionResult, CollisionConfig, CollisionAlgorithm } from '../types';
import { LinearCollisionDetector } from '../algorithms/LinearCollisionDetector';
import { QuadTreeCollisionDetector } from '../algorithms/QuadTreeCollisionDetector';
import { ConnectionPointExtractor } from '../utils/ConnectionPointExtractor';

export class CollisionDetector {
    private config: CollisionConfig;
    private workspaceWidth: number;
    private workspaceHeight: number;
    private linearDetector: LinearCollisionDetector;
    private quadTreeDetector: QuadTreeCollisionDetector;
    private connectionExtractor: ConnectionPointExtractor;

    constructor(workspaceWidth: number, workspaceHeight: number, config: CollisionConfig) {
        this.config = config;
        this.workspaceWidth = workspaceWidth;
        this.workspaceHeight = workspaceHeight;
        
        this.linearDetector = new LinearCollisionDetector(config);
        this.quadTreeDetector = new QuadTreeCollisionDetector(workspaceWidth, workspaceHeight, config);
        this.connectionExtractor = new ConnectionPointExtractor(config);
    }

    /**
     * Detect collisions between bricks
     */
    detectCollisions(bricks: IBrick[], targetBrickId?: string): CollisionResult[] {
        // Extract connection points from all bricks
        const connectionPoints = this.connectionExtractor.extractAllConnectionPoints(bricks);
        
        if (connectionPoints.length === 0) {
            return [];
        }

        // Select appropriate algorithm based on brick count
        const algorithm = this.selectAlgorithm(bricks.length);
        
        // Use selected algorithm to detect collisions
        if (algorithm === 'linear') {
            return this.linearDetector.detectCollisions(connectionPoints, targetBrickId);
        } else {
            return this.quadTreeDetector.detectCollisions(connectionPoints, targetBrickId);
        }
    }

    /**
     * Select appropriate collision detection algorithm
     */
    selectAlgorithm(brickCount: number): CollisionAlgorithm {
        if (brickCount < this.config.algorithmThreshold) {
            return 'linear';
        } else {
            return this.config.enableQuadTree ? 'quadtree' : 'linear';
        }
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: CollisionConfig): void {
        this.config = newConfig;
        this.linearDetector.updateConfig(newConfig);
        this.quadTreeDetector.updateConfig(newConfig);
        this.connectionExtractor.updateConfig(newConfig);
    }

    /**
     * Get current configuration
     */
    getConfig(): CollisionConfig {
        return { ...this.config };
    }

    /**
     * Get the connection point extractor for external access
     */
    getConnectionExtractor(): ConnectionPointExtractor {
        return this.connectionExtractor;
    }
} 