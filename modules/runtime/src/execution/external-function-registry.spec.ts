import { describe, it, expect, vi } from 'vitest';
import { SingerFunctionRegistry } from './external-function-registry';
import { defaultMusicContext } from '../music/context';
import { NoteEvent } from '../music/note-event';

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

    it('keeps saved values separate per music context', () => {
        const r = new SingerFunctionRegistry();
        const a = defaultMusicContext();
        const b = defaultMusicContext();
        b.volume = 80;
        r.executeFunction('setContext_volume', [30], a);
        r.executeFunction('setContext_volume', [10], b);
        r.executeFunction('resetContext_volume', [], a);
        r.executeFunction('resetContext_volume', [], b);
        expect(a.volume).toBe(50);
        expect(b.volume).toBe(80);
    });

    it('treats an inherited object key as an unknown parameter', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        r.executeFunction('setContext_constructor', ['x'], music);
        expect(music).toEqual(defaultMusicContext());
        expect(Object.prototype.hasOwnProperty.call(music, 'constructor')).toBe(false);
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
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

    it('playNote resolves a pitch through the context and appends an event', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', ['a', 0.25], music, events);
        expect(events).toHaveLength(1);
        const note = events[0];
        expect(Math.round(note.hz)).toBe(440);
        expect(note.name).toBe('n9');
        expect(note.octave).toBe(4);
        expect(note.cents).toBe(0);
        expect(note.durationBeats).toBe(0.25);
        expect(note.instrument).toBe('electronic synth');
        expect(note.volume).toBe(50);
    });

    it('playNote reflects context changes in the event', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('declareContext_instrument', ['guitar'], music);
        r.executeFunction('setContext_volume', [20], music);
        r.executeFunction('playNote', ['a', 1], music, events);
        expect(events[0].instrument).toBe('guitar');
        expect(events[0].volume).toBe(20);
    });

    it('playNote without an events sink is a no-op', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        expect(() => r.executeFunction('playNote', ['a', 0.25], music)).not.toThrow();
        expect(music).toEqual(defaultMusicContext());
    });
});
