import type { BrickViewProps } from './brick.types';

// -------------------------------------------------------------------------------------------------

/**
 * A single brick entry in the Palette catalog.
 *
 * In addition to cataloging metadata (`id`, `name`, `description`), this entry embeds the full
 * render config for the brick (`brick`). The Palette previews the entry by feeding this config to
 * the Brick renderer — the same renderer used in the workspace — so previews are live brick shapes
 * (colors, connectors, nesting, widgets, labels) rather than static images. The `id` keys this
 * entry to the brick's definition, which is resolved into a live model when the brick is
 * instantiated into the workspace.
 */
export interface PaletteBrickConfig {
    /** Unique identifier; key used to resolve the brick's definition/model on instantiation. */
    id: string;
    /** Display name; shown in the Palette and matched against search text. */
    name: string;
    /** Longer description; shown on hover and matched against search text. */
    description: string;
    /** Full render config; the Palette previews the entry by rendering it via the Brick renderer. */
    brick: BrickViewProps;
}

/**
 * A Section groups related bricks within a Category (e.g. "Pitch" within "Music").
 */
export interface PaletteSectionConfig {
    /** Display name of the section. */
    name: string;
    /** Source of the section's icon. */
    icon: string;
    /** Accent color for the section, as a CSS color string. */
    color: string;
    /** Ordered bricks shown in this section. */
    bricks: PaletteBrickConfig[];
}

/**
 * A Category is a top-level grouping of Sections (e.g. "Music", "Flow", "Graphics").
 */
export interface PaletteCategoryConfig {
    /** Display name of the category. */
    name: string;
    /** Source of the category's icon. */
    icon: string;
    /** Ordered sections within this category. */
    sections: PaletteSectionConfig[];
}

/**
 * Top-level configuration object for the Brick Palette.
 *
 * Defines the full Category → Section → Brick hierarchy the Palette renders.
 */
export interface PaletteConfig {
    /** Ordered categories shown in the Palette. */
    categories: PaletteCategoryConfig[];
}
