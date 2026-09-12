import { describe, expect, it } from 'vitest';

import { darkenColor } from './color';

describe('darkenColor', () => {
    it('drops lightness while keeping the hue', () => {
        // #ffb703 is hsl(43, 100%, 51%); dropping by 0.45 lands on hsl(43, 100%, 28%).
        expect(darkenColor('#ffb703', 0.45)).toBe('#8e6500');
    });

    it('expands the short hex form', () => {
        expect(darkenColor('#f00', 0.5)).toBe(darkenColor('#ff0000', 0.5));
    });

    it('keeps grays gray', () => {
        expect(darkenColor('#808080', 0.5)).toBe('#404040');
    });

    it('returns the color untouched at zero and black at one', () => {
        expect(darkenColor('#29b6f6', 0)).toBe('#29b6f6');
        expect(darkenColor('#29b6f6', 1)).toBe('#000000');
    });

    it('leaves anything that is not a plain hex color alone', () => {
        expect(darkenColor('#00000033', 0.5)).toBe('#00000033');
        expect(darkenColor('rebeccapurple', 0.5)).toBe('rebeccapurple');
    });
});
