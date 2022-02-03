/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** Interface for the KeySignature class. */
export interface IKeySignature {
    /** Getter for the pitch currently defined by the temperament. */
    readonly key: string;
    /** Getter for the current temperament mode. */
    readonly mode: string;
    /** Getter for the current "key mode" pair. */
    readonly keySignature: string;
    /** Getter for the list of notes in the scale. */
    readonly scale: string[];
    /** Setter and Getter for the state of fixed solfege. */
    fixedSolfege: boolean;
    /** Getter for the solfege notes in mode. */
    readonly solfegeNotes: string[];
    /** Getter for the number of (scalar) notes are in the scale? */
    readonly modeLength: number;
    /** Getter for the number of semitones (half-steps) in the temperament. */
    readonly numberOfSemitones: number;
    /** Getter and Setter for custom note names defined by the user. */
    customNoteNames: string[];

    /** Normalizes the scale by converting double sharps and double flats. */
    normalizeScale: (scale: string[]) => string[];
    /** Checks pitch type, including test for custom names. */
    pitchNameType: (pitchName: string) => string;
    /**
     * Converts from a letter name used by 12-semitone temperaments to a generic note name as
     * defined by the temperament.
     */
    convertToGenericNoteName: (pitchName: string) => string;
    /** Returns the corresponding pitch in the scale (and any change in octave). */
    modalPitchToLetter: (modalIndex: number) => [string, number];
    /** Checks to see if target note is in the scale. */
    noteInScale: (target: string) => boolean;
    /**
     * Given a starting pitch, add a semitone transform and return the resultant pitch (and any
     * change in octave).
     */
    semitoneTransform: (startingPitch: string, numberOfHalfSteps: number) => [string, number];
    /**
     * Given a starting pitch, adds a scalar transform and returns the resultant pitch (and any
     * change in octave).
     */
    scalarTransform: (startingPitch: string, numberOfScalarSteps: number) => [string, number];
    /** Converts a generic note name to a pitch name type. */
    genericNoteNameConvertToType: (
        pitchName: string,
        targetType: string,
        preferSharps: boolean
    ) => string;
    /** Calculates the distance between two notes in semitone steps. */
    semitoneDistance: (pitchA: string, octaveA: number, pitchB: string, octaveB: number) => number;
    /** Calculates the distance between two notes in scalar steps. */
    scalarDistance: (
        pitchA: string,
        octaveA: number,
        pitchB: string,
        octaveB: number
    ) => [number, number];
    /** Rotates a series of notes around an invert point. */
    invert: (
        pitchName: string,
        octave: number,
        invertPointPitch: string,
        invertPointOctave: number,
        invertMode: 'even' | 'odd' | 'scalar'
    ) => [string, number];
    /**
     * Given a target pitch, returns the closest note in the current key signature (key and mode).
     */
    closestNote: (target: string) => [string, number, number];
    /** Returns the key, mode, number of half steps, and the scale. */
    toString: () => string;
}
