/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { Scale } from '../scale';

describe('class Scale', () => {
    describe('Validate scale generation', () => {
        const sCMaj = new Scale([2, 2, 1, 2, 2, 2, 1], 0);
        test('Generate scale for C Major and verify', () => {
            expect(sCMaj.getScale()).toEqual(['n0', 'n2', 'n4', 'n5', 'n7', 'n9', 'n11', 'n0']);
            expect(sCMaj.numberOfSemitones).toBe(12);
            expect(sCMaj.noteNames).toEqual([
                'n0',
                'n1',
                'n2',
                'n3',
                'n4',
                'n5',
                'n6',
                'n7',
                'n8',
                'n9',
                'n10',
                'n11',
            ]);
        });

        test('Generate scale for C Major with pitch format and verify', () => {
            expect(
                sCMaj.getScale(['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']),
            ).toEqual(['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c']);
        });

        test('Generate scale for C Major with pitch format not matching with number of semitones and expect error', () => {
            expect(() => {
                sCMaj.getScale(['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a']);
            }).toThrowError('pitch format does not match number of semitones');
        });

        const sGMaj = new Scale([2, 2, 1, 2, 2, 2, 1], 7);
        test('Generate scale for G Major and verify', () => {
            expect(sGMaj.getScale()).toEqual(['n7', 'n9', 'n11', 'n0', 'n2', 'n4', 'n6', 'n7']);
        });

        test('Expect octave delta of 4th note in the G Major scale to be 1', () => {
            expect(sGMaj.getScaleAndOctaveDeltas()[1][3]).toBe(1);
        });

        test('Expect octave delta of 4th note in the G Major scale to be 1 using getOctaveDelta', () => {
            expect(sGMaj.getOctaveDelta(3)).toEqual(1);
        });

        test('Expect getOctaveDelta to throw InvalidArgumentError when noteIndex is negative', () => {
            expect(() => sGMaj.getOctaveDelta(-1)).toThrowError(
                'noteIndex must be in range of scale length.',
            );
        });

        test('Expect getOctaveDelta to throw InvalidArgumentError when noteIndex is equal to or greater than scale length', () => {
            expect(() => sGMaj.getOctaveDelta(8)).toThrowError(
                'noteIndex must be in range of scale length.',
            );
            expect(() => sGMaj.getOctaveDelta(10)).toThrowError(
                'noteIndex must be in range of scale length.',
            );
        });

        test('Expect getOctaveDelta to throw InvalidArgumentError on pentatonic scale for out-of-range index below 12', () => {
            const pentatonic = new Scale([2, 2, 3, 2, 3], 0);
            expect(pentatonic.getScale().length).toBe(6);
            expect(pentatonic.getOctaveDelta(5)).toBe(1);
            expect(() => pentatonic.getOctaveDelta(6)).toThrowError(
                'noteIndex must be in range of scale length.',
            );
        });

        const scale = new Scale();
        test('Generate scale when halfstep pattern is not defined and verify it', () => {
            expect(scale.getScale()).toEqual([
                'n0',
                'n1',
                'n2',
                'n3',
                'n4',
                'n5',
                'n6',
                'n7',
                'n8',
                'n9',
                'n10',
                'n11',
                'n0',
            ]);
        });

        const semiTones21 = new Scale([2, 2, 1, 2, 2, 2, 1], 7, 21);
        test('Generate scale for C Major when number of semitones are 21 and verify', () => {
            expect(semiTones21.getScale()).toEqual([
                'n12',
                'n15',
                'n18',
                'n0',
                'n3',
                'n6',
                'n10',
                'n12',
            ]);
        });
    });
});
