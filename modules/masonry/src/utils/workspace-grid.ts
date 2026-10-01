import type { Point } from '@/@types/common.types';
import {
    BASE_GRID_SPACING,
    DEFAULT_SCALE_LEVEL,
    SCALE_LEVEL_CONFIG,
    type ScaleLevel,
} from '@/utils/constants';

/**
 * Calculates the grid spacing in pixels for a given scale level and base spacing.
 *
 * Multiplies the base grid spacing by the scale level's `brickScale`.
 */
export function calculateGridSpacing(
    level: ScaleLevel = DEFAULT_SCALE_LEVEL,
    baseSpacing: number = BASE_GRID_SPACING,
): number {
    return baseSpacing * SCALE_LEVEL_CONFIG[level].brickScale;
}

/**
 * Generates the CSS `background-image` value with repeating linear gradients
 * along horizontal and vertical axes for the workspace grid overlay.
 */
export function generateGridBackgroundImage(spacing: number): string {
    return ['right', 'bottom']
        .map(
            (direction) =>
                `repeating-linear-gradient(to ${direction}, var(--border) 0px, var(--border) 1px, transparent 1px, transparent ${spacing}px)`,
        )
        .join(', ');
}

/**
 * Generates the CSS `background-position` value from a viewport offset point.
 */
export function generateGridBackgroundPosition(offset: Point): string {
    return `${offset.x}px ${offset.y}px`;
}

/**
 * Applies grid background styling (image and position) to a canvas element.
 */
export function applyGridStyle(canvas: HTMLElement, spacing: number, offset: Point): void {
    canvas.style.backgroundImage = generateGridBackgroundImage(spacing);
    canvas.style.backgroundPosition = generateGridBackgroundPosition(offset);
}

/**
 * Clears grid background styling (image and position) from a canvas element.
 */
export function clearGridStyle(canvas: HTMLElement): void {
    canvas.style.backgroundImage = '';
    canvas.style.backgroundPosition = '';
}
