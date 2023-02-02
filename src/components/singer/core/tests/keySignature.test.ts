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

    test('Testing scales', () => {
        const EXPECTED: [ string, string ][][] = [
            [
                ["c", "C IONIAN [c d e f g a b c]"],
                ["d", "D DORIAN [d e f g a b c d]"],
                ["e", "E PHRYGIAN [e f g a b c d e]"],
                ["f", "F LYDIAN [f g a b c d e f]"],
                ["g", "G MIXOLYDIAN [g a b c d e f g]"],
                ["a", "A AEOLIAN [a b c d e f g a]"],
                ["b", "B LOCRIAN [b c d e f g a b]"],
            ],
            [
                ["g", "G IONIAN [g a b c d e f# g]"],
                ["a", "A DORIAN [a b c d e f# g a]"],
                ["b", "B PHRYGIAN [b c d e f# g a b]"],
                ["c", "C LYDIAN [c d e f# g a b c]"],
                ["d", "D MIXOLYDIAN [d e f# g a b c d]"],
                ["e", "E AEOLIAN [e f# g a b c d e]"],
                ["f#", "F# LOCRIAN [f# g a b c d e f#]"],
            ],
            [
                ["d", "D IONIAN [d e f# g a b c# d]"],
                ["e", "E DORIAN [e f# g a b c# d e]"],
                ["f#", "F# PHRYGIAN [f# g a b c# d e f#]"],
                ["g", "G LYDIAN [g a b c# d e f# g]"],
                ["a", "A MIXOLYDIAN [a b c# d e f# g a]"],
                ["b", "B AEOLIAN [b c# d e f# g a b]"],
                ["c#", "C# LOCRIAN [c# d e f# g a b c#]"],
            ],
            [
                ["a", "A IONIAN [a b c# d e f# g# a]"],
                ["b", "B DORIAN [b c# d e f# g# a b]"],
                ["c#", "C# PHRYGIAN [c# d e f# g# a b c#]"],
                ["d", "D LYDIAN [d e f# g# a b c# d]"],
                ["e", "E MIXOLYDIAN [e f# g# a b c# d e]"],
                ["f#", "F# AEOLIAN [f# g# a b c# d e f#]"],
                ["g#", "G# LOCRIAN [g# a b c# d e f# g#]"],
            ],
            [
                ["e", "E IONIAN [e f# g# a b c# d# e]"],
                ["f#", "F# DORIAN [f# g# a b c# d# e f#]"],
                ["g#", "G# PHRYGIAN [g# a b c# d# e f# g#]"],
                ["a", "A LYDIAN [a b c# d# e f# g# a]"],
                ["b", "B MIXOLYDIAN [b c# d# e f# g# a b]"],
                ["c#", "C# AEOLIAN [c# d# e f# g# a b c#]"],
                ["d#", "D# LOCRIAN [d# e f# g# a b c# d#]"],
            ],
            [
                ["b", "B IONIAN [b c# d# e f# g# a# b]"],
                ["c#", "C# DORIAN [c# d# e f# g# a# b c#]"],
                ["d#", "D# PHRYGIAN [d# e f# g# a# b c# d#]"],
                ["e", "E LYDIAN [e f# g# a# b c# d# e]"],
                ["f#", "F# MIXOLYDIAN [f# g# a# b c# d# e f#]"],
                ["g#", "G# AEOLIAN [g# a# b c# d# e f# g#]"],
                ["a#", "A# LOCRIAN [a# b c# d# e f# g# a#]"],
            ],
            [
                ["f#", "F# IONIAN [f# g# a# b c# d# e# f#]"],
                ["g#", "G# DORIAN [g# a# b c# d# e# f# g#]"],
                ["a#", "A# PHRYGIAN [a# b c# d# e# f# g# a#]"],
                ["b", "B LYDIAN [b c# d# e# f# g# a# b]"],
                ["c#", "C# MIXOLYDIAN [c# d# e# f# g# a# b c#]"],
                ["d#", "D# AEOLIAN [d# e# f# g# a# b c# d#]"],
                ["e#", "E# LOCRIAN [e# f# g# a# b c# d# e#]"],
            ],
            [
                ["c#", "C# IONIAN [c# d# e# f# g# a# b# c#]"],
                ["d#", "D# DORIAN [d# e# f# g# a# b# c# d#]"],
                ["e#", "E# PHRYGIAN [e# f# g# a# b# c# d# e#]"],
                ["f#", "F# LYDIAN [f# g# a# b# c# d# e# f#]"],
                ["g#", "G# MIXOLYDIAN [g# a# b# c# d# e# f# g#]"],
                ["a#", "A# AEOLIAN [a# b# c# d# e# f# g# a#]"],
                ["b#", "B# LOCRIAN [b# c# d# e# f# g# a# b#]"],
            ],
            [
                ["f", "F IONIAN [f g a bb c d e f]"],
                ["g", "G DORIAN [g a bb c d e f g]"],
                ["a", "A PHRYGIAN [a bb c d e f g a]"],
                ["bb", "Bb LYDIAN [bb c d e f g a bb]"],
                ["c", "C MIXOLYDIAN [c d e f g a bb c]"],
                ["d", "D AEOLIAN [d e f g a bb c d]"],
                ["e", "E LOCRIAN [e f g a bb c d e]"],
            ],
            [
                ["bb", "Bb IONIAN [bb c d eb f g a bb]"],
                ["c", "C DORIAN [c d eb f g a bb c]"],
                ["d", "D PHRYGIAN [d eb f g a bb c d]"],
                ["eb", "Eb LYDIAN [eb f g a bb c d eb]"],
                ["f", "F MIXOLYDIAN [f g a bb c d eb f]"],
                ["g", "G AEOLIAN [g a bb c d eb f g]"],
                ["a", "A LOCRIAN [a bb c d eb f g a]"],
            ],
            [
                ["eb", "Eb IONIAN [eb f g ab bb c d eb]"],
                ["f", "F DORIAN [f g ab bb c d eb f]"],
                ["g", "G PHRYGIAN [g ab bb c d eb f g]"],
                ["ab", "Ab LYDIAN [ab bb c d eb f g ab]"],
                ["bb", "Bb MIXOLYDIAN [bb c d eb f g ab bb]"],
                ["c", "C AEOLIAN [c d eb f g ab bb c]"],
                ["d", "D LOCRIAN [d eb f g ab bb c d]"],
            ],
            [
                ["ab", "Ab IONIAN [ab bb c db eb f g ab]"],
                ["bb", "Bb DORIAN [bb c db eb f g ab bb]"],
                ["c", "C PHRYGIAN [c db eb f g ab bb c]"],
                ["db", "Db LYDIAN [db eb f g ab bb c db]"],
                ["eb", "Eb MIXOLYDIAN [eb f g ab bb c db eb]"],
                ["f", "F AEOLIAN [f g ab bb c db eb f]"],
                ["g", "G LOCRIAN [g ab bb c db eb f g]"],
            ],
            [
                ["db", "Db IONIAN [db eb f gb ab bb c db]"],
                ["eb", "Eb DORIAN [eb f gb ab bb c db eb]"],
                ["e", "E PHRYGIAN [e f g a b c d e]"],
                ["gb", "Gb LYDIAN [gb ab bb c db eb f gb]"],
                ["ab", "Ab MIXOLYDIAN [ab bb c db eb f gb ab]"],
                ["bb", "Bb AEOLIAN [bb c db eb f gb ab bb]"],
                ["c", "C LOCRIAN [c db eb f gb ab bb c]"],
            ],
            [
                ["gb", "Gb IONIAN [gb ab bb cb db eb f gb]"],
                ["ab", "Ab DORIAN [ab bb cb db eb f gb ab]"],
                ["bb", "Bb PHRYGIAN [bb cb db eb f gb ab bb]"],
                ["cb", "Cb LYDIAN [cb db eb f gb ab bb cb]"],
                ["db", "Db MIXOLYDIAN [db eb f gb ab bb cb db]"],
                ["eb", "Eb AEOLIAN [eb f gb ab bb cb db eb]"],
                ["f", "F LOCRIAN [f gb ab bb cb db eb f]"],
            ],
            [
                ["cb", "Cb IONIAN [cb db eb fb gb ab bb cb]"],
                ["db", "Db DORIAN [db eb fb gb ab bb cb db]"],
                ["eb", "Eb PHRYGIAN [eb fb gb ab bb cb db eb]"],
                ["fb", "Fb LYDIAN [fb gb ab bb cb db eb fb]"],
                ["gb", "Gb MIXOLYDIAN [gb ab bb cb db eb fb gb]"],
                ["ab", "Ab AEOLIAN [ab bb cb db eb fb gb ab]"],
                ["bb", "Bb LOCRIAN [bb cb db eb fb gb ab bb]"],
            ]
        ];

        for (let i = 0; i < EXPECTED.length; i++) {
            for (let j = 0; j < EXPECTED[i].length; j++) {
                const m = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'][j];
                const k = EXPECTED[i][j][0];
                const ks = new KeySignature(m, k);
                expect(ks.toString()).toEqual(EXPECTED[i][j][1]);
            }
        }

        const EXPECTED2: { [key: string]: { [key: string]: string } } = {
           "major pentatonic": {
               "c": "C MAJOR PENTATONIC [c d e g a c]",
               "g": "G MAJOR PENTATONIC [g a b d e g]",
               "d": "D MAJOR PENTATONIC [d e f# a b d]",
               "a": "A MAJOR PENTATONIC [a b c# e f# a]",
               "e": "E MAJOR PENTATONIC [e f# g# b c# e]",
               "b": "B MAJOR PENTATONIC [b c# d# f# g# b]",
               "f#": "F# MAJOR PENTATONIC [f# g# a# c# d# f#]",
               "db": "Db MAJOR PENTATONIC [db eb f ab bb db]",
               "ab": "Ab MAJOR PENTATONIC [ab bb c eb f ab]",
               "eb": "Eb MAJOR PENTATONIC [eb f g bb c eb]",
               "bb": "Bb MAJOR PENTATONIC [bb c d f g bb]",
               "f": "F MAJOR PENTATONIC [f g a c d f]",
           },
           "minor pentatonic": {
               "c": "C MINOR PENTATONIC [c eb f g bb c]",
               "g": "G MINOR PENTATONIC [g bb c d f g]",
               "d": "D MINOR PENTATONIC [d f g a c d]",
               "a": "A MINOR PENTATONIC [a c d e g a]",
               "e": "E MINOR PENTATONIC [e g a b d e]",
               "b": "B MINOR PENTATONIC [b d e f# a b]",
               "f#": "F# MINOR PENTATONIC [f# a b c# e f#]",
               "db": "Db MINOR PENTATONIC [db e gb ab b db]",
               "ab": "Ab MINOR PENTATONIC [ab b db eb gb ab]",
               "eb": "Eb MINOR PENTATONIC [eb gb ab bb db eb]",
               "bb": "Bb MINOR PENTATONIC [bb db eb f ab bb]",
               "f": "F MINOR PENTATONIC [f ab bb c eb f]",
            },
            "whole tone": {
               "c": "C WHOLE TONE [c d e f# g# a# c]",
               "g": "G WHOLE TONE [g a b c# d# f g]",
               "d": "D WHOLE TONE [d e f# g# a# c d]",
               "a": "A WHOLE TONE [a b c# d# f g a]",
               "e": "E WHOLE TONE [e f# g# a# c d e]",
               "b": "B WHOLE TONE [b c# d# f g a b]",
               "f#": "F# WHOLE TONE [f# g# a# c d e f#]",
               "db": "Db WHOLE TONE [db eb f g a b db]",
               "ab": "Ab WHOLE TONE [ab bb c d e gb ab]",
               "eb": "Eb WHOLE TONE [eb f g a b db eb]",
               "bb": "Bb WHOLE TONE [bb c d e gb ab bb]",
               "f": "F WHOLE TONE [f g a b db eb f]",
            }
        };

        for (const m of ['major pentatonic', 'minor pentatonic', 'whole tone']) {
            for (const k of ['c', 'g', 'd', 'a', 'e', 'b', 'f#', 'db', 'ab', 'eb', 'bb', 'f']) {
                const ks = new KeySignature(m, k);
                expect(ks.toString()).toEqual(EXPECTED2[m][k]);
            }
        }
    });
});
