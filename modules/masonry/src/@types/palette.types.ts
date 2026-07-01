import type { Size } from './brick.types';

// -------------------------------------------------------------------------------------------------

/**
 * A single brick entry in the Palette catalog.
 *
 * This is a catalog descriptor used to list and preview a brick in the Palette — it is not a live
 * brick instance. See `BrickModel` / `BrickViewProps` in `brick.types.ts` for the rendered brick.
 * The `id` keys this entry to the brick's definition, which is resolved when the brick is
 * instantiated into the workspace.
 */
export interface PaletteBrickConfig {
    /** Unique identifier; key used to resolve the brick's definition/model on instantiation. */
    id: string;
    /** Display name; shown in the Palette and matched against search text. */
    name: string;
    /** Longer description; shown on hover and matched against search text. */
    description: string;
    /** Source of the thumbnail graphic previewed as the brick in the Palette. */
    thumbnail: string;
    /** Bounding-box dimensions of the thumbnail preview, in pixels. */
    bbox: Size;
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
