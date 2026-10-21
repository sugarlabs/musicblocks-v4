/*
 * Copyright (c) 2021,2 Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import KeySignature from '../keySignature';
import CurrentPitch from '../currentPitch';

describe('class CurrentPitch', () => {
    test("Instantiate with no arguments and expect generic note name and frequency to be 'n7' and 392 Hz, respectively", () => {
        const cp = new CurrentPitch();
        expect(Math.round(cp.freq)).toBe(392);
        expect(cp.genericName).toBe('n7');
    });

    describe('Scalar transposition', () => {
        describe('Scalar transpose from 392 Hz by 1 scalar step', () => {
            const cp = new CurrentPitch();
            cp.applyScalarTransposition(1);

            test("Expect generic note name to be 'n9'", () => {
                expect(cp.genericName).toBe('n9');
            });

            test('Expect frequency to be 440 Hz', () => {
                expect(Math.round(cp.freq)).toBe(440);
            });

            test('Expect scalar interval -1 to be note with frequncy 392 Hz', () => {
                expect(Math.round(cp.getScalarInterval(-1))).toBe(392);
            });
        });
    });

    describe('Semitone transposition', () => {
        describe('Semitone transpose from 440 Hz previous by -2 half steps', () => {
            const cp = new CurrentPitch();
            cp.applyScalarTransposition(1);
            cp.applySemitoneTransposition(-2);

            test("Expect generic note name to be 'n7'", () => {
                expect(cp.genericName).toBe('n7');
            });

            test('Expect frequency to be 392 Hz', () => {
                expect(Math.round(cp.freq)).toBe(392);
            });

            test('Expect semitone interval 2 to be note with frequncy 440 Hz', () => {
                expect(Math.round(cp.getSemitoneInterval(2))).toBe(440);
            });
        });
    });

    describe('Set pitch', () => {
        const cp = new CurrentPitch();

        test("Set pitch to 440 Hz and expect generic note name and frequency to be 'n9' and 440 Hz, respectively", () => {
            cp.setPitch(440);
            expect(cp.genericName).toBe('n9');
            expect(Math.round(cp.freq)).toBe(440);
        });

        test('Set pitch to modal index 7 and octave 4 and expect frequency to be 392 Hz', () => {
            cp.setPitch(7, 4);
            expect(Math.round(cp.freq)).toBe(392);
        });

        test("Set pitch to generic note 'n7' and octave 4 and expect frequency to be 392 Hz", () => {
            cp.setPitch('n7', 4);
            expect(Math.round(cp.freq)).toBe(392);
        });

        test("Set pitch to letter note 'g' and octave 4 and expect frequency to be 392 Hz", () => {
            cp.setPitch('g', 4);
            expect(Math.round(cp.freq)).toBe(392);
        });

        test("Set pitch to solfege 'sol' and octave 4 and expect frequency to be 392 Hz", () => {
            cp.setPitch('sol', 4);
            expect(Math.round(cp.freq)).toBe(392);
        });

        test('Set pitch to pitch number 55 and expect frequency to be 392 Hz', () => {
            cp.setPitch(55);
            expect(Math.round(cp.freq)).toBe(392);
        });

        test("Set pitch to semitone index 11 and octave 4 and expect generic note name 'n11' and octave 4", () => {
            cp.setPitch(11, 4);
            expect(cp.genericName).toBe('n11');
            expect(cp.octave).toBe(4);
            expect(cp.semitoneIndex).toBe(11);
        });

        test("Set pitch to pitch number 12 and expect generic note name 'n0' and octave 1", () => {
            cp.setPitch(12);
            expect(cp.genericName).toBe('n0');
            expect(cp.octave).toBe(1);
            expect(cp.semitoneIndex).toBe(0);
            expect(Math.round(cp.freq)).toBe(33);
        });

        test('Transpose note set by pitch number 12 and expect valid generic note names', () => {
            cp.setPitch(12);
            cp.applyScalarTransposition(1);
            expect(cp.genericName).toBe('n2');
            cp.applySemitoneTransposition(1);
            expect(cp.genericName).toBe('n3');
        });
    });

    describe('Test scalar step', () => {
        const ks = new KeySignature('major', 'g');
        test('Walk through a scale and expect ocatve to switch at C', () => {
            const cp = new CurrentPitch(ks);
            for (let i = 0; i < ks.modeLength; i++) {
                cp.applyScalarTransposition(1);
            }
        });
    });
});
