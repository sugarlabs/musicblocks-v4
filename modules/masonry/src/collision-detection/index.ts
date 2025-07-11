/**
 * Collision Detection System
 * Production-ready collision detection for MusicBlocks v4
 */

// Core exports
export { BrickCollisionService } from './core/BrickCollisionService';
export { CollisionDetector } from './core/CollisionDetector';

// Algorithm exports
export { LinearCollisionDetector } from './algorithms/LinearCollisionDetector';
export { QuadTreeCollisionDetector } from './algorithms/QuadTreeCollisionDetector';

// Utility exports
export { ConnectionPointExtractor } from './utils/ConnectionPointExtractor';

// Type exports
export type {
    CollisionResult,
    CollisionConfig,
    ConnectionType,
    BrickConnectionPoint,
    CollisionAlgorithm,
    CollisionEventType,
    CollisionEvent
} from './types';

// Default configuration is available in types/index.ts 