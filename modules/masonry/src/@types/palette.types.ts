import type { ComponentType, CSSProperties } from 'react';

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
 * A Category is the middle grouping level — the sub-group shown as a button in the Palette's left
 * sidebar (e.g. "Rhythm", "Intervals", "Flow"). Its bricks are stacked as one section in the main
 * scrollable list, and clicking its sidebar button scrolls the list to that category.
 */
export interface PaletteCategoryConfig {
    /** Display name of the category; shown on the sidebar button and the main list header. */
    name: string;
    /** Icon component for the category, supplied by the config provider (e.g. a lucide-react icon). */
    icon: ComponentType<{ className?: string; style?: CSSProperties }>;
    /** Accent color for the category, as a CSS color string; tints its icon and header. */
    color: string;
    /** Ordered bricks shown in this category. */
    bricks: PaletteBrickConfig[];
}

/**
 * A Classification is the top grouping level — the tab selected from the compact icon row at the
 * top of the Palette (e.g. "Music", "Logic", "Art"). Selecting a classification swaps which set of
 * categories the sidebar and main list show.
 */
export interface PaletteClassificationConfig {
    /** Display name of the classification; used as the tab's accessible label. */
    name: string;
    /** Icon component for the classification, supplied by the config provider (e.g. a lucide-react icon). */
    icon: ComponentType<{ className?: string; style?: CSSProperties }>;
    /** Ordered categories shown when this classification is active. */
    categories: PaletteCategoryConfig[];
}

/**
 * Top-level configuration object for the Brick Palette.
 *
 * Defines the full Classification → Category → Brick hierarchy the Palette renders.
 */
export interface PaletteConfig {
    /** Ordered classifications shown as tabs in the Palette. */
    classifications: PaletteClassificationConfig[];
}

/**
 * Props for the Palette view component.
 *
 * Carries the full Classification → Category → Brick hierarchy the palette view renders.
 */
export interface PaletteViewProps {
    /** Full Classification → Category → Brick hierarchy the palette renders. */
    config: PaletteConfig;
}
