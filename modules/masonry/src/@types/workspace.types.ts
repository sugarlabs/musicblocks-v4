import type { PaletteConfig } from './palette.types';

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
