/**
 * Linear Collision Detection Algorithm
 * Simple O(n²) algorithm suitable for small datasets (< 20 bricks)
 */

import type { BrickConnectionPoint, CollisionResult, CollisionConfig } from '../types';

export class LinearCollisionDetector {
  private config: CollisionConfig;

  constructor(config: CollisionConfig) {
    this.config = config;
  }

  /**
   * Detect collisions using linear algorithm
   */
  detectCollisions(
    connectionPoints: BrickConnectionPoint[],
    targetBrickId?: string
  ): CollisionResult[] {
    const collisions: CollisionResult[] = [];
    const radius = this.config.connectionRadius;

    for (let i = 0; i < connectionPoints.length; i++) {
      const source = connectionPoints[i];
      
      // Skip if we're looking for a specific brick and this isn't it
      if (targetBrickId && source.brickId !== targetBrickId) {
        continue;
      }

      for (let j = 0; j < connectionPoints.length; j++) {
        if (i === j) continue;

        const target = connectionPoints[j];
        
        // Don't check collisions within the same brick
        if (source.brickId === target.brickId) {
          continue;
        }

        const distance = this.calculateDistance(source, target);
        
        if (distance <= radius) {
          const isValidConnection = this.validateConnection(source, target);
          const connectionType = this.determineConnectionType(source, target);
          
          collisions.push({
            id: `${source.id}-${target.id}`,
            sourceBrickId: source.brickId,
            targetBrickId: target.brickId,
            sourceConnectionPoint: source,
            targetConnectionPoint: target,
            distance,
            isValidConnection,
            connectionType,
            timestamp: Date.now()
          });
        }
      }
    }

    return collisions;
  }

  /**
   * Calculate Euclidean distance between two points
   */
  private calculateDistance(point1: BrickConnectionPoint, point2: BrickConnectionPoint): number {
    const dx = point1.worldX - point2.worldX;
    const dy = point1.worldY - point2.worldY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Validate if two connection points can form a valid connection
   */
  private validateConnection(source: BrickConnectionPoint, target: BrickConnectionPoint): boolean {
    // Basic validation: opposite sides can connect
    const oppositeSides = {
      'top': 'bottom',
      'bottom': 'top',
      'left': 'right',
      'right': 'left'
    };

    return oppositeSides[source.side] === target.side;
  }

  /**
   * Determine the type of connection between two points
   */
  private determineConnectionType(source: BrickConnectionPoint, target: BrickConnectionPoint): import('../types').ConnectionType {
    // Return a default connection type based on brick types
    return 'simple_to_simple';
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: CollisionConfig): void {
    this.config = newConfig;
  }
} 