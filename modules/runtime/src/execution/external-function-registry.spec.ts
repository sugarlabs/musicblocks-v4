import { describe, it, expect, vi } from 'vitest';
import { CurrentPitch, KeySignature, Temperament } from '@sugarlabs/mb4-module-singer/core';
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

    const expectedCurrentPitch = (pitch: number | string, music = defaultMusicContext()) => {
        const ks = new KeySignature(music.mode, music.key);
        const t = new Temperament(music.temperament);
        const cp = new CurrentPitch(ks, t);
        cp.setPitch(pitch, music.octave);
        return cp;
    };

    it('resolves numeric frequency 440 to match CurrentPitch', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [440, 0.25], music, events);
        expect(events).toHaveLength(1);
        const expected = expectedCurrentPitch(440, music);
        expect(events[0].hz).toBeCloseTo(expected.freq);
        expect(events[0].name).toBe(expected.genericName);
        expect(events[0].octave).toBe(expected.octave);
        expect(Math.round(events[0].hz)).toBe(440);
        expect(events[0].name).toBe('n9');
    });

    it('resolves numeric frequency 261.63 according to temperament resolution', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [261.63, 0.25], music, events);
        expect(events).toHaveLength(1);
        const expected = expectedCurrentPitch(261.63, music);
        expect(events[0].hz).toBeCloseTo(expected.freq);
        expect(events[0].name).toBe(expected.genericName);
        expect(events[0].octave).toBe(expected.octave);
        expect(Math.round(events[0].hz)).toBe(262);
        expect(events[0].name).toBe('n0');
    });

    it('resolves valid integer semitone index (9 for A4) to match CurrentPitch', () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [9, 0.5], music, events);
        expect(events).toHaveLength(1);
        const expected = expectedCurrentPitch(9, music);
        expect(events[0].hz).toBeCloseTo(expected.freq);
        expect(events[0].name).toBe(expected.genericName);
        expect(events[0].octave).toBe(expected.octave);
        expect(Math.round(events[0].hz)).toBe(440);
        expect(events[0].name).toBe('n9');
    });

    it("resolves written note name 'a' to match CurrentPitch", () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', ['a', 0.25], music, events);
        expect(events).toHaveLength(1);
        const expected = expectedCurrentPitch('a', music);
        expect(events[0].hz).toBeCloseTo(expected.freq);
        expect(events[0].name).toBe(expected.genericName);
        expect(events[0].octave).toBe(expected.octave);
        expect(Math.round(events[0].hz)).toBe(440);
        expect(events[0].name).toBe('n9');
    });

    it("handles written note name 'c4' matching CurrentPitch interpretation", () => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', ['c4', 0.25], music, events);
        expect(events).toHaveLength(1);
        const expected = expectedCurrentPitch('c4', music);
        expect(events[0].hz).toBeCloseTo(expected.freq);
        expect(events[0].name).toBe(expected.genericName);
        expect(events[0].octave).toBe(expected.octave);
    });

    it('rejects invalid numeric inputs without emitting note events', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [-100, 0.25], music, events);
        r.executeFunction('playNote', [-1, 0.25], music, events);
        expect(events).toHaveLength(0);
        expect(warn).toHaveBeenCalledTimes(2);
        warn.mockRestore();
    });

    it('rejects NaN and Infinity without emitting note events', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [NaN, 0.25], music, events);
        r.executeFunction('playNote', [Infinity, 0.25], music, events);
        r.executeFunction('playNote', [-Infinity, 0.25], music, events);
        expect(events).toHaveLength(0);
        expect(warn).toHaveBeenCalledTimes(3);
        warn.mockRestore();
    });

    it('rejects missing or unsupported pitch types without emitting note events', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [undefined, 0.25], music, events);
        r.executeFunction('playNote', [null, 0.25], music, events);
        r.executeFunction('playNote', [{}, 0.25], music, events);
        r.executeFunction('playNote', [true, 0.25], music, events);
        expect(events).toHaveLength(0);
        expect(warn).toHaveBeenCalledTimes(4);
        warn.mockRestore();
    });

    it('rejects empty and whitespace note-name input without emitting note events', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', ['', 0.25], music, events);
        r.executeFunction('playNote', ['   ', 0.25], music, events);
        expect(events).toHaveLength(0);
        expect(warn).toHaveBeenCalledTimes(2);
        warn.mockRestore();
    });
});
