import { describe, it, expect } from 'vitest';
import { SingerFunctionRegistry } from '../execution/external-function-registry';
import { defaultMusicContext } from './context';
import { NoteEvent } from './note-event';

/**
 * Parity checks against v3 for 12-EDO equal temperament, where singer already agrees with v3.
 *
 * Not covered yet: non-equal temperaments and movable-do. Those depend on the larger singer
 * temperament fixes (octave drift, A4 = 440 anchor, mode table, tune) that are not on develop.
 */
describe('playNote parity with v3 (12-EDO, C major, equal)', () => {
    const play = (name: string, octave: number): NoteEvent => {
        const r = new SingerFunctionRegistry();
        const music = defaultMusicContext();
        music.octave = octave;
        const events: NoteEvent[] = [];
        r.executeFunction('playNote', [name, 1], music, events);
        return events[0];
    };

    // v3 getNote + pitchToFrequency, 12-EDO, rounded to the nearest hertz.
    const cases: [string, number, string, number][] = [
        ['c', 4, 'n0', 262],
        ['e', 4, 'n4', 330],
        ['f', 4, 'n5', 349],
        ['g', 4, 'n7', 392],
        ['a', 4, 'n9', 440],
        ['b', 4, 'n11', 494],
        ['c', 5, 'n0', 523],
        // Boundary accidentals cross the octave: b#4 sounds as c5, cb4 as b3.
        ['b#', 4, 'n0', 523],
        ['cb', 4, 'n11', 247],
    ];

    it.each(cases)('%s%d resolves to %s at %d Hz', (name, octave, generic, hz) => {
        const note = play(name, octave);
        expect(note.name).toBe(generic);
        expect(Math.round(note.hz)).toBe(hz);
    });

    it('fixed-do sol in C major resolves to G (392 Hz, n7)', () => {
        const note = play('sol', 4);
        expect(note.name).toBe('n7');
        expect(Math.round(note.hz)).toBe(392);
    });

    it('two contexts generate independent event lists', () => {
        const r = new SingerFunctionRegistry();
        const a = defaultMusicContext();
        const b = defaultMusicContext();
        const eventsA: NoteEvent[] = [];
        const eventsB: NoteEvent[] = [];
        r.executeFunction('setContext_volume', [20], b);
        r.executeFunction('playNote', ['a', 1], a, eventsA);
        r.executeFunction('playNote', ['a', 1], b, eventsB);
        expect(eventsA[0].volume).toBe(50);
        expect(eventsB[0].volume).toBe(20);
    });
});
