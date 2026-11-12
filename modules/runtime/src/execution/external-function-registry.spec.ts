import { describe, it, expect, vi } from 'vitest';
import { SingerFunctionRegistry } from './external-function-registry';
import { defaultMusicContext } from '../music/context';

describe('SingerFunctionRegistry', () => {
    it('claims music functions and nothing else', () => {
        const r = new SingerFunctionRegistry();
        expect(r.hasFunction('playNote')).toBe(true);
        expect(r.hasFunction('setContext_volume')).toBe(true);
        expect(r.hasFunction('resetContext_volume')).toBe(true);
        expect(r.hasFunction('declareContext_key')).toBe(true);
        expect(r.hasFunction('forward')).toBe(false);
    });

    it('declareContext sets the field without saving (it persists)', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('declareContext_key', ['g'], music);
        expect(music.key).toBe('g');
        r.executeFunction('resetContext_key', [], music);
        // No save was made by declare, so reset falls back to the default.
        expect(music.key).toBe('c');
    });

    it('setContext saves, then reset restores the previous value', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('setContext_volume', [30], music);
        expect(music.volume).toBe(30);
        r.executeFunction('resetContext_volume', [], music);
        expect(music.volume).toBe(50);
    });

    it('nested setContext restores values in order', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('setContext_volume', [30], music);
        r.executeFunction('setContext_volume', [10], music);
        expect(music.volume).toBe(10);
        r.executeFunction('resetContext_volume', [], music);
        expect(music.volume).toBe(30);
        r.executeFunction('resetContext_volume', [], music);
        expect(music.volume).toBe(50);
    });

    it('reset with nothing saved restores the default', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        music.volume = 80;
        r.executeFunction('resetContext_volume', [], music);
        expect(music.volume).toBe(50);
    });

    it('coerces the value to the field type', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('setContext_volume', ['30'], music);
        expect(music.volume).toBe(30);
        r.executeFunction('declareContext_movableDo', [1], music);
        expect(music.movableDo).toBe(true);
    });

    it('warns and ignores an unknown context parameter', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        expect(() => r.executeFunction('setContext_tempo', [120], music)).not.toThrow();
        expect(music).toEqual(defaultMusicContext());
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });

    it('playNote does not change the context yet', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('playNote', ['sol', 0.25], music);
        expect(music).toEqual(defaultMusicContext());
    });
});
