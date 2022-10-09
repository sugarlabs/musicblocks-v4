/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/**
 * Unit tests for KeySignature
 */

import KeySignature from '../keySignature';
import Temperament from '../temperament';
import {
    getPitchType,
    CUSTOM_NAME,
    LETTER_NAME,
    SOLFEGE_NAME,
    GENERIC_NOTE_NAME,
    SCALAR_MODE_NUMBER,
    UNKNOWN_PITCH_NAME,
    EAST_INDIAN_SOLFEGE_NAME
} from '../musicUtils';

describe('Key Signature', () => {
    test('instantiation', () => {
        const ks = new KeySignature('major', 'c');
        expect(ks.modeLength).toBe(7);
        expect(ks.numberOfSemitones).toBe(12);
    });

    test('closest note tests', () => {
        const ks: KeySignature = new KeySignature('major', 'c');
        expect(ks.closestNote('c')[0]).toBe('c');
        expect(ks.noteInScale('c')).toBe(true);
        expect(ks.closestNote('f#')[0]).toBe('f');
        expect(ks.noteInScale('f#')).toBe(false);
        expect(ks.closestNote('g#')[0]).toBe('g');
        expect(ks.noteInScale('g#')).toBe(false);
        expect(ks.closestNote('cb')[0]).toBe('b');
        expect(ks.noteInScale('cb')).toBe(true);
        expect(ks.closestNote('db')[0]).toBe('c');
        expect(ks.noteInScale('db')).toBe(false);
        expect(ks.closestNote('n10#')[0]).toBe('n11');
        expect(ks.closestNote('n10x')[0]).toBe('n0');
        expect(ks.closestNote('sol')[0]).toBe('sol');
        expect(ks.closestNote('pa')[0]).toBe('pa');
    });

    test('scalar distance', () => {
        const ks = new KeySignature('major', 'c');
        expect(ks.scalarDistance('g', 4, 'c', 4)[0]).toBe(-4);
        expect(ks.scalarDistance('c', 4, 'g', 4)[0]).toBe(4);
        expect(ks.scalarDistance('g', 3, 'c', 4)[0]).toBe(3);
        expect(ks.scalarDistance('c', 4, 'g', 3)[0]).toBe(-3);
    });

    test('semitone distance', () => {
        const ks = new KeySignature('major', 'c');
        expect(ks.semitoneDistance('g', 4, 'c', 4)).toBe(-7);
        expect(ks.semitoneDistance('c', 4, 'g', 4)).toBe(7);
        expect(ks.semitoneDistance('g', 3, 'c', 4)).toBe(5);
        expect(ks.semitoneDistance('c', 4, 'g', 3)).toBe(-5);
    });

    test('scalar transforms', () => {
        const ks: KeySignature = new KeySignature('major', 'c');
        expect(ks.scalarTransform('c', 2)[0]).toBe('e');
        expect(ks.scalarTransform('c#', 2)[0]).toBe('f');
        const ks1: KeySignature = new KeySignature('major', 'g');
        expect(ks1.scalarTransform('g', 1)[1]).toBe(0);
        expect(ks1.scalarTransform('g', 2)[1]).toBe(0);
        expect(ks1.scalarTransform('g', 3)[1]).toBe(1);
        expect(ks1.scalarTransform('g', 4)[1]).toBe(1);
        expect(ks1.scalarTransform('n7', 1)[1]).toBe(0);
        expect(ks1.scalarTransform('n7', 2)[1]).toBe(0);
        expect(ks1.scalarTransform('n7', 3)[1]).toBe(1);
        expect(ks1.scalarTransform('n7', 4)[1]).toBe(1);
        expect(ks1.scalarTransform('c', 1)[1]).toBe(0);
        expect(ks1.scalarTransform('c', 2)[1]).toBe(0);
        expect(ks1.scalarTransform('c', -1)[1]).toBe(-1);
        expect(ks1.scalarTransform('c', 8)[1]).toBe(1);
        expect(ks1.scalarTransform('n0', 1)[1]).toBe(0);
        expect(ks1.scalarTransform('n0', 2)[1]).toBe(0);
        expect(ks1.scalarTransform('n0', -1)[1]).toBe(-1);
        expect(ks1.scalarTransform('n0', 8)[1]).toBe(1);
    });

    test('semitone transforms', () => {
        const ks: KeySignature = new KeySignature('major', 'c');
        expect(ks.semitoneTransform('c', 2)[0]).toBe('d');
        expect(ks.semitoneTransform('c', 2)[1]).toBe(0);
        expect(ks.semitoneTransform('c#', 2)[0]).toBe('d#');
        expect(ks.semitoneTransform('c#', 2)[1]).toBe(0);
        expect(ks.semitoneTransform('b', 1)[0]).toBe('c');
        expect(ks.semitoneTransform('b', 1)[1]).toBe(1); // increment octave
        expect(ks.semitoneTransform('n3', 1)[0]).toBe('n4');
        expect(ks.semitoneTransform('n3#', 1)[0]).toBe('n5');
        expect(ks.semitoneTransform('n0', -1)[0]).toBe('n11');
        expect(ks.semitoneTransform('n0', -1)[1]).toBe(-1); // decrement octave
        expect(ks.semitoneTransform('n0b', -1)[0]).toBe('n10');
        expect(ks.semitoneTransform('n0b', -1)[1]).toBe(-1); // decrement octave
        expect(ks.semitoneTransform('n1b', -1)[0]).toBe('n11');
        expect(ks.semitoneTransform('n1b', -1)[1]).toBe(-1); // decrement octave
        expect(ks.semitoneTransform('n11x', 1)[0]).toBe('n2');
        expect(ks.semitoneTransform('n11x', 1)[1]).toBe(1); // increment octave
        const ks1: KeySignature = new KeySignature('major', 'G');
        expect(ks1.semitoneTransform('c', 2)[0]).toBe('d');
        expect(ks1.semitoneTransform('c', 2)[1]).toBe(0);
        expect(ks1.semitoneTransform('c#', 2)[0]).toBe('d#');
        expect(ks1.semitoneTransform('c#', 2)[1]).toBe(0);
        expect(ks1.semitoneTransform('b', 1)[0]).toBe('c');
        expect(ks1.semitoneTransform('b', 1)[1]).toBe(1); // increment octave
        expect(ks1.semitoneTransform('n3', 1)[0]).toBe('n4');
        expect(ks1.semitoneTransform('n3#', 1)[0]).toBe('n5');
        expect(ks1.semitoneTransform('g', -1)[0]).toBe('f#');
        expect(ks1.semitoneTransform('g', -1)[1]).toBe(0);
        expect(ks1.semitoneTransform('gb', -1)[0]).toBe('f');
        expect(ks1.semitoneTransform('gb', -1)[1]).toBe(0);
        expect(ks1.semitoneTransform('a#', -1)[0]).toBe('a');
        expect(ks1.semitoneTransform('a#', -1)[1]).toBe(0);
        expect(ks1.semitoneTransform('c', -1)[0]).toBe('b');
        expect(ks1.semitoneTransform('c', -1)[1]).toBe(-1); // decrement octave
    });

    test('invert transforms', () => {
        const ks: KeySignature = new KeySignature('major', 'c');
        expect(ks.invert('f', 5, 'c', 5, 'even')[0]).toBe('g');
        expect(ks.invert('f', 5, 'c', 5, 'even')[1]).toBe(4);
        expect(ks.invert('f', 4, 'c', 5, 'even')[1]).toBe(5);
        expect(ks.invert('d', 5, 'c', 5, 'even')[0]).toBe('a#');
        expect(ks.invert('f', 5, 'c', 5, 'odd')[0]).toBe('g#');
        expect(ks.invert('d', 5, 'c', 5, 'odd')[0]).toBe('b');
        expect(ks.invert('f', 5, 'c', 5, 'scalar')[0]).toBe('g');
        expect(ks.invert('d', 5, 'c', 5, 'scalar')[0]).toBe('b');
        expect(ks.invert('g', 5, 'c', 5, 'scalar')[0]).toBe('f');
        expect(ks.invert('b', 5, 'c', 5, 'scalar')[0]).toBe('d');

        const t = new Temperament();
        expect(
            Math.floor(
                t.getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('a'), 4) + 0.5
            )
        ).toBe(440);

        const ks1 = new KeySignature('chromatic', 'c');
        expect(ks1.modeLength).toBe(12);
        expect(ks1.numberOfSemitones).toBe(12);
        expect(ks1.scalarTransform('c', 2)[0]).toBe('d');
        expect(ks1.scalarTransform('c#', 2)[0]).toBe('d#');
        expect(ks1.semitoneTransform('c', 2)[0]).toBe('d');
        expect(ks1.semitoneTransform('c#', 2)[0]).toBe('d#');
        expect(ks1.semitoneTransform('b', 1)[0]).toBe('c');

        // const t1 = new Temperament('third comma meantone');
        const ks2 = new KeySignature([2, 2, 1, 2, 2, 2, 7, 1], 'n0');
        expect(ks2.modeLength).toBe(8);
        expect(ks2.numberOfSemitones).toBe(19);
        expect(ks2.scale.length).toBe(8);
        expect(ks2.scale[7]).toBe('n18');
        expect(ks2.closestNote('n12')[0]).toBe('n11');
        expect(ks2.scalarTransform('n5', 2)[0]).toBe('n9');
        expect(ks2.closestNote('n10#')[0]).toBe('n11');
    });

    test('Mode equivalents', () => {
        let ks = new KeySignature('major', 'e');
        const source = ks.normalizeScale(ks.scale).sort();
        ks = new KeySignature('minor', 'db');
        let target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('minor', 'c#');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('locrian', 'eb');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('locrian', 'd#');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('mixolydian', 'b');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('lydian', 'a');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('phrygian', 'g#');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('phrygian', 'ab');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('dorian', 'f#');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature('dorian', 'gb');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
        ks = new KeySignature([2, 2, 1, 2, 2, 2, 1], 'e');
        target = ks.normalizeScale(ks.scale);
        expect(source).toEqual(target.sort());
    });

    test('solfege mapper', () => {
        let ks = new KeySignature('major', 'c');
        expect(ks.solfegeNotes.length).toBe(8);

        ks = new KeySignature('major pentatonic', 'c');
        expect(ks.solfegeNotes.length).toBe(6);
        expect(ks.solfegeNotes[2]).toBe('me');
        expect(ks.solfegeNotes[3]).toBe('sol');

        ks = new KeySignature('minor pentatonic', 'c');
        expect(ks.solfegeNotes.length).toBe(6);
        expect(ks.solfegeNotes[2]).toBe('fa');
        expect(ks.solfegeNotes[3]).toBe('sol');

        ks = new KeySignature('whole tone', 'c');
        expect(ks.solfegeNotes.length).toBe(7);
        expect(ks.solfegeNotes[2]).toBe('me');
        expect(ks.solfegeNotes[4]).toBe('sol');

        ks = new KeySignature('chromatic', 'c');
        expect(ks.solfegeNotes.length).toBe(13);
        expect(ks.solfegeNotes[2]).toBe('re');
        expect(ks.solfegeNotes[3]).toBe('meb');

        ks = new KeySignature();
        expect(ks.convertToGenericNoteName('g')).toBe('n7');
        expect(ks.convertToGenericNoteName('sol')).toBe('n7');
        expect(ks.convertToGenericNoteName('5')).toBe('n7');
        expect(ks.convertToGenericNoteName('pa')).toBe('n7');
        expect(ks.convertToGenericNoteName('g#')).toBe('n8');
        expect(ks.convertToGenericNoteName('sol#')).toBe('n8');
        expect(ks.convertToGenericNoteName('5#')).toBe('n8');
        expect(ks.convertToGenericNoteName('pa#')).toBe('n8');

        ks.customNoteNames = ['charlie', 'delta', 'echo', 'foxtrot', 'golf', 'alfa', 'bravo'];
        expect(ks.convertToGenericNoteName('golf')).toBe('n7');
        expect(ks.convertToGenericNoteName('golf#')).toBe('n8');

        expect(ks.semitoneTransform('g', 3)[0]).toBe('a#');
        expect(ks.semitoneTransform('n7', 3)[0]).toBe('n10');
        expect(ks.semitoneTransform('sol', 3)[0]).toBe('tib');
        expect(ks.semitoneTransform('5', 3)[0]).toBe('7b');
        expect(ks.semitoneTransform('pa', 3)[0]).toBe('nib');
        expect(ks.semitoneTransform('golf', 3)[0]).toBe('n10');
    });

    test('type conversions', () => {
        const ks = new KeySignature();
        ks.customNoteNames = ['charlie', 'delta', 'echo', 'foxtrot', 'golf', 'alfa', 'bravo'];
        expect(ks.genericNoteNameConvertToType('n7', LETTER_NAME)).toBe('g');
        expect(ks.genericNoteNameConvertToType('n7', SOLFEGE_NAME)).toBe('sol');
        expect(ks.genericNoteNameConvertToType('n8', SOLFEGE_NAME)).toBe('sol#');
        expect(ks.genericNoteNameConvertToType('n9', SOLFEGE_NAME)).toBe('la');
        expect(ks.genericNoteNameConvertToType('n7', EAST_INDIAN_SOLFEGE_NAME)).toBe('pa');
        expect(ks.genericNoteNameConvertToType('n7', SCALAR_MODE_NUMBER)).toBe('5');
        expect(ks.genericNoteNameConvertToType('n7', CUSTOM_NAME)).toBe('golf');

        // Modal pitch starts at 0
        expect(ks.modalPitchToLetter(4)[0]).toBe('g');
    });

    test('pitch type check', () => {
        const ks = new KeySignature();
        ks.customNoteNames = ['charlie', 'delta', 'echo', 'foxtrot', 'golf', 'alfa', 'bravo'];
        expect(ks.pitchNameType('g')).toBe(LETTER_NAME);
        expect(ks.pitchNameType('c#')).toBe(LETTER_NAME);
        expect(ks.pitchNameType('n7')).toBe(GENERIC_NOTE_NAME);
        expect(ks.pitchNameType('n7b')).toBe(GENERIC_NOTE_NAME);
        expect(ks.pitchNameType('sol')).toBe(SOLFEGE_NAME);
        expect(ks.pitchNameType('sol#')).toBe(SOLFEGE_NAME);
        expect(ks.pitchNameType('pa')).toBe(EAST_INDIAN_SOLFEGE_NAME);
        expect(ks.pitchNameType('5')).toBe(SCALAR_MODE_NUMBER);
        expect(ks.pitchNameType('golf')).toBe(CUSTOM_NAME);
        expect(ks.pitchNameType('foobar')).toBe(UNKNOWN_PITCH_NAME);
        expect(getPitchType('g')).toBe(LETTER_NAME);
        expect(getPitchType('c#')).toBe(LETTER_NAME);
        expect(getPitchType('n7')).toBe(GENERIC_NOTE_NAME);
        expect(getPitchType('n7b')).toBe(GENERIC_NOTE_NAME);
        expect(getPitchType('sol')).toBe(SOLFEGE_NAME);
        expect(getPitchType('sol#')).toBe(SOLFEGE_NAME);
        expect(getPitchType('pa')).toBe(EAST_INDIAN_SOLFEGE_NAME);
        expect(getPitchType('5')).toBe(SCALAR_MODE_NUMBER);
        expect(getPitchType('foobar')).toBe(UNKNOWN_PITCH_NAME);
    });

    test('fixed solfege', () => {
        const ks = new KeySignature('major', 'g');
        expect(ks.genericNoteNameConvertToType('n7', SOLFEGE_NAME)).toBe('sol');
        expect(ks.convertToGenericNoteName('sol')).toBe('n7');
        ks.fixedSolfege = true;
        expect(ks.fixedSolfege).toBe(true);
        expect(ks.genericNoteNameConvertToType('n7', SOLFEGE_NAME)).toBe('do');
        expect(ks.convertToGenericNoteName('do')).toBe('n7');
    });

    test('frequency conversion', () => {
        const t = new Temperament();
        const ks = new KeySignature();
        ks.customNoteNames = ['charlie', 'delta', 'echo', 'foxtrot', 'golf', 'alfa', 'bravo'];

        expect(
            Number(
                t.getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('g'), 4).toFixed(2)
            )
        ).toBe(392.0);
        expect(
            Number(
                t
                    .getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('sol'), 4)
                    .toFixed(2)
            )
        ).toBe(392.0);
        expect(
            Number(
                t.getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('5'), 4).toFixed(2)
            )
        ).toBe(392.0);
        expect(
            Number(
                t.getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('pa'), 4).toFixed(2)
            )
        ).toBe(392.0);
        expect(
            Number(
                t
                    .getFreqByGenericNoteNameAndOctave(ks.convertToGenericNoteName('golf'), 4)
                    .toFixed(2)
            )
        ).toBe(392.0);
    });

    test('Testing meantone scales', () => {
        let ks = new KeySignature([], 'c', 21);
        expect(ks.modeLength).toBe(21);
        expect(ks.numberOfSemitones).toBe(21);
        expect(ks.closestNote('cb')[0]).toBe('cb');
        expect(ks.semitoneTransform('gb', 1)[0]).toBe('g');
        expect(ks.semitoneTransform('cb', 3)[0]).toBe('d');
        expect(ks.semitoneTransform('c', -3)[0]).toBe('bb');
        ks = new KeySignature([3, 3, 3, 3, 3, 3, 3], 'c', 21);
        expect(ks.closestNote('cb')[0]).toBe('c');
        expect(ks.closestNote('db')[0]).toBe('d');
        expect(ks.closestNote('c#')[0]).toBe('c');
        expect(ks.scalarTransform('c', 1)[0]).toBe('d');
        ks = new KeySignature('major', 'c', 21);
        expect(ks.closestNote('cb')[0]).toBe('c');
        expect(ks.closestNote('db')[0]).toBe('d');
        expect(ks.closestNote('c#')[0]).toBe('c');
        expect(ks.scalarTransform('c', 1)[0]).toBe('d');
        ks = new KeySignature('lydian', 'bb', 21);
        expect(ks.closestNote('bb')[0]).toBe('bb');
        expect(ks.closestNote('n18')[0]).toBe('n17');
    });

    test('print scales', () => {
        // function print_scales() {
        //     let ks = new KeySignature('ionian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'f');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'b');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'g#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'g#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'd#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'd#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'e');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'g#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'a#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'g#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'a#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'b');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'd#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'e#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'c#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'd#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'e#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'f#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'g#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'a#');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'b#');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'f');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'a');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'e');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'd');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'f');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'a');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'f');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'g');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'ab');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'd');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'ab');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'c');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'db');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'f');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'g');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'db');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'fb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'gb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'ab');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'c');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'gb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'ab');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'cb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'db');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'f');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        //     ks = new KeySignature('ionian', 'cb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('dorian', 'db');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('phrygian', 'eb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('lydian', 'fb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('mixolydian', 'gb');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('aeolian', 'ab');
        //     console.log(ks.scale.join(' '));
        //     ks = new KeySignature('locrian', 'bb');
        //     console.log(ks.scale.join(' '));
        //     console.log();
        // }

        for (const m of ['major pentatonic', 'minor pentatonic', 'whole tone']) {
            for (const k of ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'db', 'ab', 'eb', 'bb', 'f']) {
                const ks = new KeySignature(m, k);
                console.log(ks.toString());
            }
        }
    });
});
