import { describe, expect, it } from 'vitest';

import { DEFAULT_GRID_SPACING, DEFAULT_SCALE_LEVEL, SCALE_LEVEL_CONFIG } from '@/utils/constants';
import {
    applyGridStyle,
    calculateGridSpacing,
    clearGridStyle,
    generateGridBackgroundImage,
    generateGridBackgroundPosition,
} from '@/utils/workspace-grid';

describe('workspace-grid utility', () => {
    describe('calculateGridSpacing', () => {
        it('calculates default grid spacing at the default scale level', () => {
            const spacing = calculateGridSpacing();
            expect(spacing).toBe(
                DEFAULT_GRID_SPACING * SCALE_LEVEL_CONFIG[DEFAULT_SCALE_LEVEL].brickScale,
            );
        });

        it('derives grid spacing from SCALE_LEVEL_CONFIG[level].brickScale', () => {
            const level1Spacing = calculateGridSpacing(1);
            expect(level1Spacing).toBe(DEFAULT_GRID_SPACING * SCALE_LEVEL_CONFIG[1].brickScale);

            const level2Spacing = calculateGridSpacing(2);
            expect(level2Spacing).toBe(DEFAULT_GRID_SPACING * SCALE_LEVEL_CONFIG[2].brickScale);

            const level3Spacing = calculateGridSpacing(3);
            expect(level3Spacing).toBe(DEFAULT_GRID_SPACING * SCALE_LEVEL_CONFIG[3].brickScale);
        });

        it('supports a custom base spacing when provided', () => {
            const customBase = 40;
            expect(calculateGridSpacing(1, customBase)).toBe(
                customBase * SCALE_LEVEL_CONFIG[1].brickScale,
            );
            expect(calculateGridSpacing(2, customBase)).toBe(
                customBase * SCALE_LEVEL_CONFIG[2].brickScale,
            );
            expect(calculateGridSpacing(3, customBase)).toBe(
                customBase * SCALE_LEVEL_CONFIG[3].brickScale,
            );
        });
    });

    describe('generateGridBackgroundImage', () => {
        it('generates repeating linear gradients with the specified spacing', () => {
            const spacing = calculateGridSpacing(3);
            const bg = generateGridBackgroundImage(spacing);

            expect(bg).toBe(
                `repeating-linear-gradient(to right, var(--border) 0px, var(--border) 1px, transparent 1px, transparent ${spacing}px), repeating-linear-gradient(to bottom, var(--border) 0px, var(--border) 1px, transparent 1px, transparent ${spacing}px)`,
            );
        });
    });

    describe('generateGridBackgroundPosition', () => {
        it('produces "0px 0px" for a zero viewport offset', () => {
            const pos = generateGridBackgroundPosition({ x: 0, y: 0 });
            expect(pos).toBe('0px 0px');
        });

        it('does NOT multiply the viewport offset by brickScale', () => {
            const offset = { x: 120, y: 80 };
            const pos = generateGridBackgroundPosition(offset);
            expect(pos).toBe('120px 80px');
        });
    });

    describe('applyGridStyle and clearGridStyle', () => {
        it('applies grid background image and position to an element without touching other styles', () => {
            const element = {
                style: {
                    backgroundImage: '',
                    backgroundPosition: '',
                    backgroundColor: 'rgb(255, 255, 255)',
                },
            } as unknown as HTMLElement;

            const spacing = calculateGridSpacing(DEFAULT_SCALE_LEVEL);
            applyGridStyle(element, spacing, { x: 40, y: 10 });

            expect(element.style.backgroundImage).toBe(generateGridBackgroundImage(spacing));
            expect(element.style.backgroundPosition).toBe('40px 10px');
            expect(element.style.backgroundColor).toBe('rgb(255, 255, 255)');
        });

        it('clears grid background image and position from an element', () => {
            const element = {
                style: {
                    backgroundImage: '',
                    backgroundPosition: '',
                    backgroundColor: 'rgb(255, 255, 255)',
                },
            } as unknown as HTMLElement;

            const spacing = calculateGridSpacing(DEFAULT_SCALE_LEVEL);
            applyGridStyle(element, spacing, { x: 40, y: 10 });
            clearGridStyle(element);

            expect(element.style.backgroundImage).toBe('');
            expect(element.style.backgroundPosition).toBe('');
            expect(element.style.backgroundColor).toBe('rgb(255, 255, 255)');
        });
    });
});
