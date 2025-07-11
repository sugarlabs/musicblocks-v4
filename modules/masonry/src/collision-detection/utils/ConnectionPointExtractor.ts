/**
 * Connection Point Extractor
 * Extracts and converts connection points from bricks to world coordinates
 */

import type { IBrick } from '../../@types/brick';
import type { TConnectionPoints } from '../../brick/view/utils/common';
import type { BrickConnectionPoint, CollisionConfig, ConnectionType } from '../types';
import type { TPoint } from '../../@types/tower';

export class ConnectionPointExtractor {
    private config: CollisionConfig;
    private brickPositions: Map<string, TPoint> = new Map();

    constructor(config: CollisionConfig) {
        this.config = config;
    }

    /**
     * Extract connection points from a single brick
     */
    extractConnectionPoints(brick: IBrick): BrickConnectionPoint[] {
        const points: BrickConnectionPoint[] = [];
        const connectionPoints = brick.connectionPoints;
        const boundingBox = brick.boundingBox;
        
        // Get brick position
        const brickX = this.getBrickX(brick);
        const brickY = this.getBrickY(brick);
        const scale = brick.scale || 1;

        // Extract connection points from each side
        if (connectionPoints.top) {
            points.push(...this.extractSidePoints(brick, 'top', connectionPoints.top, brickX, brickY, scale));
        }

        if (connectionPoints.right) {
            points.push(...this.extractSidePoints(brick, 'right', connectionPoints.right, brickX, brickY, scale));
        }

        if (connectionPoints.bottom) {
            points.push(...this.extractSidePoints(brick, 'bottom', connectionPoints.bottom, brickX, brickY, scale));
        }

        if (connectionPoints.left) {
            points.push(...this.extractSidePoints(brick, 'left', connectionPoints.left, brickX, brickY, scale));
        }

        return points;
    }

    /**
     * Extract connection points from all bricks
     */
    extractAllConnectionPoints(bricks: IBrick[]): BrickConnectionPoint[] {
        const allPoints: BrickConnectionPoint[] = [];
        
        for (const brick of bricks) {
            const brickPoints = this.extractConnectionPoints(brick);
            allPoints.push(...brickPoints);
        }

        return allPoints;
    }

    /**
     * Set brick positions for coordinate conversion
     */
    setBrickPositions(positions: Map<string, TPoint>): void {
        this.brickPositions = new Map(positions);
    }

    /**
     * Update position for a specific brick
     */
    updateBrickPosition(brickId: string, position: TPoint): void {
        this.brickPositions.set(brickId, position);
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: CollisionConfig): void {
        this.config = newConfig;
    }

    /**
     * Extract connection points from a specific side
     */
    private extractSidePoints(
        brick: IBrick,
        side: 'top' | 'right' | 'bottom' | 'left',
        sidePoints: any,
        brickX: number,
        brickY: number,
        scale: number
    ): BrickConnectionPoint[] {
        const points: BrickConnectionPoint[] = [];

        if (Array.isArray(sidePoints)) {
            // Multiple connection points on this side
            sidePoints.forEach((point, index) => {
                const worldX = brickX + (point.x * scale);
                const worldY = brickY + (point.y * scale);
                
                points.push({
                    id: `${brick.uuid}:${side}:${index}`,
                    brickId: brick.uuid,
                    side,
                    index,
                    worldX,
                    worldY,
                    radius: this.config.connectionRadius,
                    type: this.determineConnectionType(brick, side)
                });
            });
        } else {
            // Single connection point on this side
            const worldX = brickX + (sidePoints.x * scale);
            const worldY = brickY + (sidePoints.y * scale);
            
            points.push({
                id: `${brick.uuid}:${side}`,
                brickId: brick.uuid,
                side,
                worldX,
                worldY,
                radius: this.config.connectionRadius,
                type: this.determineConnectionType(brick, side)
            });
        }

        return points;
    }

    /**
     * Get brick X position
     */
    private getBrickX(brick: IBrick): number {
        const position = this.brickPositions.get(brick.uuid);
        return position ? position.x : 0;
    }

    /**
     * Get brick Y position
     */
    private getBrickY(brick: IBrick): number {
        const position = this.brickPositions.get(brick.uuid);
        return position ? position.y : 0;
    }

    /**
     * Determine connection type based on brick and side
     */
    private determineConnectionType(brick: IBrick, side: string): ConnectionType {
        // This is a simplified implementation
        // You may need to expand this based on your specific brick types and connection rules
        const brickName = brick.name?.toLowerCase() || '';
        
        if (brickName.includes('expression')) {
            return 'expression_to_simple';
        } else if (brickName.includes('compound')) {
            return 'compound_to_simple';
        } else {
            return 'simple_to_simple';
        }
    }
} 