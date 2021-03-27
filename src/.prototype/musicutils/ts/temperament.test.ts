/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import Temperament from './temperament';

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
            }).toThrow(new Error('ItemNotFoundError: pitch z not found.'));
        });
    });

    describe('Nearest Frequency Index', () => {
        const t = new Temperament();

        test('Finds the index of the frequency nearest to the target frequency i.e 440 Hz', () => {
            const num: number = t.getNearestFreqIndex(440);
            expect(num).toBe(57);
        });
    });

    describe('Model Index', () => {
        const t = new Temperament();

        test('Returns the index 4 associated with a generic note name n4', () => {
            const num: number = t.getModalIndex('n4');
            expect(num).toBe(4);
        });

        test('Returns the index -1 when a generic note name is invalid', () => {
            const num: number = t.getModalIndex('a');
            expect(num).toBe(-1);
        });
    });

    describe('Node Name', () => {
        const t = new Temperament();

        test('Returns the generic note n2 name associated with an index of 2', () => {
            const str: string = t.getNoteName(2);
            expect(str).toBe('n2');
        });
    });

    describe('Frequency by Index', () => {
        const t = new Temperament();

        test('Returns C0 frequency by index 0 into the frequency list.', () => {
            const num: number = t.getFreqByIndex(0);
            expect(num).toBe(16.3516);
        });
        test('Returns frequency 51.91309408272643 by index 20 into the frequency list.', () => {
            const num: number = t.getFreqByIndex(20);
            expect(num).toBe(51.91309408272643);
        });
    });

    describe('Get frequency by Model Index and Octave', () => {
        const t = new Temperament();

        test('Get freq 73.41620171654219 when model Index is 2 and octave 2', () => {
            const num: number = t.getFreqByModalIndexAndOctave(2, 2);
            expect(num).toBe(73.41620171654219);
        });
        test('Get freq 16.3516 when model Index is 2 and octave -1', () => {
            const num: number = t.getFreqByModalIndexAndOctave(2, -1);
            expect(num).toBe(16.3516);
        });

        test('Get freq undefined when model Index is 20 and octave 100', () => {
            const num: number = t.getFreqByModalIndexAndOctave(20, 10);
            expect(num).toBe(undefined);
        });
    });

    describe('Get generic note name and octave from freq index', () => {
        const t = new Temperament();

        test('get generic note n10 and octave 0 from freq index 10', () => {
            const tuple: [string, number] = t.getGenericNoteNameAndOctaveByFreqIndex(10);
            expect(tuple).toStrictEqual(['n10', 0]);
        });
    });
    describe('Get frequency by Genric Note Name and Octave', () => {
        const t = new Temperament();

        test('Get freq 16.3516 Hz when genric Note is n10 octave 0', () => {
            const num: number = t.getFreqByGenericNoteNameAndOctave('n0', 0);
            expect(num).toBe(16.3516);
        });
        test('Get error when genric note is invalid', () => {
            expect(() => {
                t.getFreqByGenericNoteNameAndOctave('a', 2);
            }).toThrow(new Error('ItemNotFoundError: Note a not found in generic note names.'));
        });
    });

    describe('Get frequency Index by Genric Note Name and Octave', () => {
        const t = new Temperament();

        test('Get freq index 22  when genric Note is n10 octave 1', () => {
            const num: number = t.getFreqIndexByGenericNoteNameAndOctave('n10', 1);
            expect(num).toBe(22);
        });
        test('Get error when genric note is invalid', () => {
            expect(() => {
                t.getFreqIndexByGenericNoteNameAndOctave('a', 2);
            }).toThrow(new Error('ItemNotFoundError: Note a not found in generic note names.'));
        });
    });
});
