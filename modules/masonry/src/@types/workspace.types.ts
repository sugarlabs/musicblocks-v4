import type { Point } from './common.types';
import type { PaletteConfig } from './palette.types';
import type { TowerNode } from './tower.types';

// -------------------------------------------------------------------------------------------------

/**
 * Top-level configuration object for the Workspace.
 *
 * Currently carries only the Palette's config; later PRs will extend this with config for the
 * Workspace's other composed pieces.
 */
export interface WorkspaceConfig {
    /** Config for the composed Palette. */
    palette: PaletteConfig;
}

/**
 * Props for the Workspace view component.
 */
export interface WorkspaceViewProps {
    /** Config for the Workspace and its composed pieces. */
    config: WorkspaceConfig;
}

/**
 * Represents a single tower instance positioned in the workspace.
 */
export interface TowerState {
    /** Unique identifier for the tower instance in the workspace */
    id: string;
    /** The root node of the tower tree */
    root: TowerNode;
    /** The absolute position of the tower in the workspace */
    position: Point;
}

/**
 * Metadata for a statement connector point in the collision space.
 * Allows querying the corresponding Brick and Tower instance from a collision hit.
 */
export interface StatementConnectorMeta {
    /** The unique ID of the connector point, matching the CollisionObject's id */
    id: number;
    /** The ID of the tower this connector belongs to */
    towerId: string;
    /** The ID of the brick this connector belongs to */
    brickId: string;
    /** The type of notch this connector represents */
    type: 'prev' | 'next' | 'nestedNext';
}

/**
 * Metadata for an argument connector point in the collision space.
 * Allows querying the corresponding Brick and Tower instance from a collision hit.
 */
export interface ArgumentConnectorMeta {
    /** The unique ID of the connector point, matching the CollisionObject's id */
    id: number;
    /** The ID of the tower this connector belongs to */
    towerId: string;
    /** The ID of the brick this connector belongs to */
    brickId: string;
    /** The type of argument connector this represents */
    type: 'input' | 'output';
    /** The declaration-order index of the argument slot; present only on `input` connectors */
    slotIndex?: number;
}
