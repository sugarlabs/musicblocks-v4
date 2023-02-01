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
            expect(Number(f[21].toFixed(2))).toBe(35.18);
            expect(t.noteNames.length).toBe(19);
        });

        test("Generate 'pythagorean' temperament instance and verify frequencies", () => {
            const t = new Temperament('pythagorean');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.19); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'just intonation' temperament instance and verify frequencies", () => {
            const t = new Temperament('just intonation');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(54.51); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'quarter comma meantone' temperament instance and verify frequencies", () => {
            const t = new Temperament('quarter comma meantone');
            const f: number[] = t.freqs;
            expect(Number(f[36].toFixed(2))).toBe(55.45); // A1
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
            expect(num).toBe(16.3516);
        });

        test('Expect frequency of index 20 into the frequency list to be 51.91309408272643', () => {
            const num: number = t.getFreqByIndex(20);
            expect(num).toBe(51.91309408272643);
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

        test('Expect frequency ~ 2637.02 Hz when modal index is 20 and octave is 100', () => {
            const num: number = t.getFreqByModalIndexAndOctave(20, 100);
            expect(Math.round(num * 100) / 100).toBe(2637.02);
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
            expect(num).toBe(16.3516);
        });

        test("Expect frequency 16.3516 Hz when generic note name is 'a' (invalid)", () => {
            const num: number = t.getFreqByGenericNoteNameAndOctave('n0', 0);
            expect(num).toBe(16.3516);
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

        test("Expect frequency index 88 when generic note name is 'n10' octave is 100", () => {
            const num: number = t.getFreqIndexByGenericNoteNameAndOctave('n10', 100);
            expect(num).toBe(88);
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
});
