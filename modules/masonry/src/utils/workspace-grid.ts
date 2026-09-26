import type { Point } from '@/@types/common.types';
import {
    DEFAULT_GRID_SPACING,
    DEFAULT_SCALE_LEVEL,
    SCALE_LEVEL_CONFIG,
    type ScaleLevel,
} from '@/utils/constants';

export function calculateGridSpacing(
    level: ScaleLevel = DEFAULT_SCALE_LEVEL,
    baseSpacing: number = DEFAULT_GRID_SPACING,
): number {
    return baseSpacing * SCALE_LEVEL_CONFIG[level].brickScale;
}

export function generateGridBackgroundImage(spacing: number): string {
    return ['right', 'bottom']
        .map(
            (direction) =>
                `repeating-linear-gradient(to ${direction}, var(--border) 0px, var(--border) 1px, transparent 1px, transparent ${spacing}px)`,
        )
        .join(', ');
}

export function generateGridBackgroundPosition(offset: Point): string {
    return `${offset.x}px ${offset.y}px`;
}

export function applyGridStyle(canvas: HTMLElement, spacing: number, offset: Point): void {
    canvas.style.backgroundImage = generateGridBackgroundImage(spacing);
    canvas.style.backgroundPosition = generateGridBackgroundPosition(offset);
}

export function clearGridStyle(canvas: HTMLElement): void {
    canvas.style.backgroundImage = '';
    canvas.style.backgroundPosition = '';
}
