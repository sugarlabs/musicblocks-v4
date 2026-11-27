/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import Temperament from '../temperament';
import { PitchTuple } from '../../@types/temperament';

describe('class Temperament', () => {
    describe('Temperament generation', () => {
        test("Generate 'equal 12' temperament instance and verify members", () => {
            const t = new Temperament();
            expect(t.name).toBe('equal');

            t.baseFrequency = Temperament.C0;
            expect(t.baseFrequency).toBe(Temperament.C0);
            expect(t.numberOfOctaves).toBe(8);

            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.0);
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'equal 1' temperament instance when negative number of octaves is provided, and verify the numbers", () => {
            const t = new Temperament();
            t.generateEqualTemperament(-2);
            expect(t.numberOfSemitonesInOctave).toBe(1);
            expect(t.numberOfNotesInTemperament).toBe(1);
        });

        test("Generate 'third comma meantone' temperament instance and verify frequencies", () => {
            const t = new Temperament('third comma meantone');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(35.5);
            expect(t.noteNames.length).toBe(19);
        });

        test("Generate 'pythagorean' temperament instance and verify frequencies", () => {
            const t = new Temperament('pythagorean');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'just intonation' temperament instance and verify frequencies", () => {
            const t = new Temperament('just intonation');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'quarter comma meantone' temperament instance and verify frequencies", () => {
            const t = new Temperament('quarter comma meantone');
            const f: number[] = t.freqs;
            expect(Number(f[36].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(21);
        });

        test("Generate 'equal 24' temperament instance and verify frequencies", () => {
            const t = new Temperament();
            t.generateEqualTemperament(24);
            const f: number[] = t.freqs;
            expect(Number(f[42].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(24);
        });

        test("Generate 'equal 24' temperament instance when 'Invalid' temperament is provided and verify frequencies", () => {
            const t = new Temperament('Invalid');
            t.generateEqualTemperament(24);
            const f: number[] = t.freqs;
            expect(Number(f[42].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(24);
        });

        test('Generate custom temperament instance and verify frequencies', () => {
            const t = new Temperament();
            const intervals: string[] = ['perfect 1', 'perfect 8'];
            const ratios: { [key: string]: number } = {
                'perfect 1': Math.pow(2, 1 / 12),
                'perfect 8': 2,
            };
            const name = 'custom';
            t.generateCustom(intervals, ratios, name);
            expect(t.name).toBe('custom');
            expect(t.numberOfSemitonesInOctave).toBe(2);
            expect(t.numberOfNotesInTemperament).toBe(9);
        });
    });

    describe('Tuning', () => {
        const t = new Temperament();

        test('Tune A4 to 440 Hz and expect 58th frequency to be 440Hz C0 (1st) to be 16.35 Hz', () => {
            t.tune('a', 4, 440.0);
            expect(Number(t.freqs[57].toFixed(2))).toBe(440.0);
            expect(Number(t.baseFrequency.toFixed(2))).toBe(16.35);
        });

        test('Tune A4 to 441 Hz and expect C0 to be 16.39 Hz', () => {
            t.tune('a', 4, 441.0);
            expect(Number(t.baseFrequency.toFixed(2))).toBe(16.39);
            expect(Number(t.freqs[57].toFixed(2))).toBe(441.0);
        });

        test('Tune gb4 to 441 Hz and expect C0 to be 19.49 Hz', () => {
            t.tune('gb', 4, 441.0);
            expect(Number(t.baseFrequency.toFixed(2))).toBe(19.49);
            expect(Number(t.freqs[57].toFixed(2))).toBe(524.44);
        });

        test('Tune z4 to 441 Hx and except a pitch not found error', () => {
            expect(() => {
                t.tune('z', 4, 441.0);
            }).toThrowError("Pitch 'z' not found.");
        });
    });

    describe('Nearest Frequency Index', () => {
        const t = new Temperament();

        test('Expect the index of the frequency nearest to the target frequency i.e 440 Hz to be 57', () => {
            const num: number = t.getNearestFreqIndex(440);
            expect(num).toBe(57);
        });

        test('Expect the PitchTuple of the frequency 440 to be ["n9", 4, 0]', () => {
            const pt: PitchTuple = t.frequencyToPitchOctaveCents(440);
            expect(pt[0]).toBe('n9');
            expect(pt[1]).toBe(4);
            expect(pt[2]).toBe(0);
        });

        test('Expect the PitchTuple of the frequency 441 to be ["n9", 4, 10]', () => {
            const pt: PitchTuple = t.frequencyToPitchOctaveCents(442);
            expect(pt[0]).toBe('n9');
            expect(pt[1]).toBe(4);
            expect(pt[2]).toBe(8);
        });

        test('Expect the PitchTuple of the frequency 439 to be ["n8", 4, 90]', () => {
            const pt: PitchTuple = t.frequencyToPitchOctaveCents(439);
            expect(pt[0]).toBe('n8');
            expect(pt[1]).toBe(4);
            expect(pt[2]).toBe(96);
        });
    });

    describe('Modal Index', () => {
        const t = new Temperament();

        test("Expect index 4 associated with a generic note name 'n4'", () => {
            const num: number = t.getModalIndex('n4');
            expect(num).toBe(4);
        });

        test("Expect index -1 when a generic note name is 'a' (invalid)", () => {
            const num: number = t.getModalIndex('a');
            expect(num).toBe(-1);
        });
    });

    describe('Note Name', () => {
        const t = new Temperament();

        test("Expect generic note name 'n2' associated with an index of 2", () => {
            const str: string = t.getNoteName(2);
            expect(str).toBe('n2');
        });
    });

    describe('Frequency by Index', () => {
        const t = new Temperament();

        test('Expect frequency of index 0 into the frequency list to be 16.3516', () => {
            const num: number = t.getFreqByIndex(0);
            expect(num).toBeCloseTo(16.3516, 4);
        });

        test('Expect frequency of index 20 into the frequency list to be 51.91308719749314', () => {
            const num: number = t.getFreqByIndex(20);
            expect(num).toBeCloseTo(51.91308719749314, 10);
        });
    });

    describe('Frequency from Modal Index and Octave', () => {
        const t = new Temperament();

        test('Expect frequency ~ 73.42 Hz when modal index is 2 and octave is 2', () => {
            const num: number = t.getFreqByModalIndexAndOctave(2, 2);
            expect(Math.round(num * 100) / 100).toBe(73.42);
        });
        test('Expect frequency ~ 16.35 Hz when modal index is 2 and octave is -1', () => {
            const num: number = t.getFreqByModalIndexAndOctave(2, -1);
            expect(Math.round(num * 100) / 100).toBe(16.35);
        });

        test('Expect frequency ~ 4186.01 Hz (C8) when modal index is 20 and octave is 100', () => {
            const num: number = t.getFreqByModalIndexAndOctave(20, 100);
            expect(Math.round(num * 100) / 100).toBe(4186.01);
        });
    });

    describe('Generic Note Name and Octave from Frequency Index', () => {
        const t = new Temperament();

        test("Expect generic note name 'n10' and octave 0 from frequency index 10", () => {
            const tuple: [string, number] = t.getGenericNoteNameAndOctaveByFreqIndex(10);
            expect(tuple).toStrictEqual(['n10', 0]);
        });
    });

    describe('Frequency from Generic Note Name and Octave', () => {
        const t = new Temperament();

        test("Expect frequency 16.3516 Hz when generic note name is 'n0' and octave is 0", () => {
            const num: number = t.getFreqByGenericNoteNameAndOctave('n0', 0);
            expect(num).toBeCloseTo(16.3516, 4);
        });

        test("Expect error when generic note name is 'a' (invalid)", () => {
            expect(() => {
                t.getFreqByGenericNoteNameAndOctave('a', 0);
            }).toThrowError("Note 'a' not found in generic note names.");
        });

        test("Expect frequency 442 Hz when generic note name is 'n9', octave is 4, cents is 8 ", () => {
            const num: number = t.getFreqByGenericPitchNameOctaveCents(['n9', 4, 8]);
            expect(num.toFixed(0)).toBe('442');
        });

        test('Expect error when cents is -200 (invalid) ', () => {
            expect(() => {
                t.getFreqByGenericPitchNameOctaveCents(['n9', 4, -200]);
            }).toThrowError('cents < -100 || cents > 100');
        });

        const jit = new Temperament('just intonation');
        test("Expect frequency 440 Hz when pitch is ['n9', 4, 0] ", () => {
            const num: number = jit.getFreqByGenericPitchNameOctaveCents(['n9', 4, 0]);
            expect(num.toFixed(0)).toBe('440');
        });

        test("Expect frequency 443 Hz when pitch is ['n9', 4, 10] ", () => {
            const num: number = jit.getFreqByGenericPitchNameOctaveCents(['n9', 4, 10]);
            expect(num.toFixed(0)).toBe('443');
        });
    });

    describe('Frequency Index from Generic Note Name and Octave', () => {
        const t = new Temperament();

        test("Expect frequency index 22 when generic note name is 'n10' and octave is 1", () => {
            const num: number = t.getFreqIndexByGenericNoteNameAndOctave('n10', 1);
            expect(num).toBe(22);
        });

        test("Expect frequency index 0 when generic note name is 'n10' and octave is -1", () => {
            const num: number = t.getFreqIndexByGenericNoteNameAndOctave('n10', -1);
            expect(num).toBe(0);
        });

        test("Expect frequency index 96 when generic note name is 'n10' octave is 100", () => {
            const num: number = t.getFreqIndexByGenericNoteNameAndOctave('n10', 100);
            expect(num).toBe(96);
        });

        test("Get error when generic note name is 'a' and octave is 2 (invalid)", () => {
            expect(() => {
                t.getFreqIndexByGenericNoteNameAndOctave('a', 2);
            }).toThrowError("Note 'a' not found in generic note names.");
        });
    });

    describe('Modal Index and Octave from Frequency Index', () => {
        const t = new Temperament();

        test('Expect modal index 2 and octave 0 from frequency index 2', () => {
            const tuple: [number, number] = t.getModalIndexAndOctaveFromFreqIndex(2);
            expect(tuple).toStrictEqual([2, 0]);
        });
    });

    describe('Octave range', () => {
        test('the table runs from C0 to C8 with every note of every octave', () => {
            const t = new Temperament();
            expect(t.numberOfNotesInTemperament).toBe(8 * 12 + 1);
            expect(Number(t.freqs[0].toFixed(2))).toBe(16.35); // C0
            expect(Number(t.freqs[t.freqs.length - 1].toFixed(2))).toBe(4186.01); // C8
        });

        test('a note above E7 resolves to its own frequency instead of E7', () => {
            const t = new Temperament();
            const e7: number = t.getFreqByGenericNoteNameAndOctave('n4', 7);
            const c8: number = t.getFreqByGenericNoteNameAndOctave('n0', 8);
            expect(Number(e7.toFixed(2))).toBe(2637.02);
            expect(Number(c8.toFixed(2))).toBe(4186.01);
        });

        test.each(['equal', 'just intonation', 'pythagorean', 'quarter comma meantone'])(
            'every octave of %s is built from its own root',
            (name) => {
                const t = new Temperament(name);
                const n = t.numberOfSemitonesInOctave;
                for (let i = n; i < t.freqs.length; i++) {
                    expect(t.freqs[i] / t.freqs[i - n]).toBeCloseTo(2, 9);
                }
            },
        );
    });

    describe('A4 = 440 Hz', () => {
        // [temperament, generic name of A]
        test.each([
            ['equal', 'n9'],
            ['just intonation', 'n9'],
            ['pythagorean', 'n9'],
            ['third comma meantone', 'n14'],
            ['quarter comma meantone', 'n15'],
        ])('A4 is 440 Hz in %s', (name, a) => {
            const t = new Temperament(name);
            expect(t.getFreqByGenericNoteNameAndOctave(a, 4)).toBeCloseTo(440, 6);
        });

        test('A4 is 440 Hz in 19 step equal temperament', () => {
            const t = new Temperament();
            t.generateEqualTemperament(19);
            expect(t.getFreqByGenericNoteNameAndOctave('n14', 4)).toBeCloseTo(440, 6);
        });

        test('C4 is 264 Hz in just intonation', () => {
            const t = new Temperament('just intonation');
            expect(t.getFreqByGenericNoteNameAndOctave('n0', 4)).toBeCloseTo(264, 6);
        });
    });
});
