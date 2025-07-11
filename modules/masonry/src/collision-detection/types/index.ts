/**
 * Collision Detection System Types
 * Production-ready type definitions for the collision detection system
 */

import type { IBrick } from '../../@types/brick';
import type { TPoint } from '../../@types/tower';

/**
 * Types of connections between bricks
 */
export type ConnectionType = 
    | 'expression_to_simple'
    | 'expression_to_compound'
    | 'simple_to_expression'
    | 'compound_to_expression'
    | 'simple_to_simple'
    | 'compound_to_compound'
    | 'simple_to_compound'
    | 'compound_to_simple';

/**
 * Represents a connection point on a brick with its world coordinates
 */
export interface BrickConnectionPoint {
    id: string; // Format: "brickId:side:index" (e.g., "brick1:right:0")
    brickId: string;
    side: 'top' | 'right' | 'bottom' | 'left';
    index?: number; // For multiple connection points on the same side
    worldX: number;
    worldY: number;
    radius: number; // Collision detection radius
    type: ConnectionType;
}

/**
 * Result of a collision detection check
 */
export interface CollisionResult {
    id: string; // Unique collision ID
    sourceBrickId: string;
    targetBrickId: string;
    sourceConnectionPoint: BrickConnectionPoint;
    targetConnectionPoint: BrickConnectionPoint;
    distance: number;
    connectionType: ConnectionType;
    isValidConnection: boolean;
    timestamp: number;
}

/**
 * Connection state tracking
 */
export interface ConnectionState {
    sourceBrickId: string;
    targetBrickId: string;
    sourceConnectionId: string;
    targetConnectionId: string;
    connectionType: ConnectionType;
    isActive: boolean;
    establishedAt: number;
}

/**
 * Configuration for collision detection
 */
export interface CollisionConfig {
    connectionRadius: number; // Default radius for connection point collision detection
    algorithmThreshold: number; // Brick count threshold for switching between linear and quadtree
    maxCollisionDistance: number; // Maximum distance for collision detection
    enableQuadTree: boolean;
    debugMode: boolean;
}

/**
 * Collision detection algorithm type
 */
export type CollisionAlgorithm = 'linear' | 'quadtree';

/**
 * Event types for collision detection
 */
export type CollisionEventType = 
    | 'collision_start'
    | 'collision_end'
    | 'connection_established'
    | 'connection_broken'
    | 'brick_moved';

/**
 * Collision event payload
 */
export interface CollisionEvent {
    type: CollisionEventType;
    brickId?: string;
    collisionResult?: CollisionResult;
    connectionPointId?: string;
    timestamp: number;
}

/**
 * QuadTree node for spatial partitioning
 */
export interface QuadTreeNode {
    x: number;
    y: number;
    width: number;
    height: number;
    points: BrickConnectionPoint[];
    children: QuadTreeNode[];
}

/**
 * Tower node for integration
 */
export interface TowerNode {
    brick: IBrick;
    position: TPoint;
}

/**
 * Default collision configuration
 */
export const DEFAULT_COLLISION_CONFIG: CollisionConfig = {
    connectionRadius: 50,
    algorithmThreshold: 20,
    maxCollisionDistance: 100,
    enableQuadTree: true,
    debugMode: false
}; 