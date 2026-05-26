/**
 * Common utilities for brick view components
 */

import type { TColor } from '../../../@types/brick';

export const FONT_HEIGHT = 16;

export const PADDING = {
    top: 4,
    right: 8,
    bottom: 4,
    left: 8,
};

/**
 * Convert color format to CSS color string
 */
export function toCssColor(color: TColor) {
    if (typeof color === 'string') return color;
    const [mode, a, b, c] = color;
    return mode === 'rgb' ? `rgb(${a},${b},${c})` : `hsl(${a},${b}%,${c}%)`;
}

/**
 * Connection points type definition
 */
export type TConnectionPoints = {
    top?: { x: number; y: number };
    right: { x: number; y: number }[];
    bottom?: { x: number; y: number };
    left?: { x: number; y: number };
    args?: { x: number; y: number }[];
    nested?: { x: number; y: number };
};
