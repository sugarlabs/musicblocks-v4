/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** A tuple containing a pitch name, an octave, and cents */
export type PitchTuple = [string, number, number];

/** Interface for the Temperament class. */
export interface ITemperament {
    /** Setter and Getter for the base frequency (in Hertz) used to seed the calculations. */
    baseFrequency: number;
    /** Setter and Getter for the number of octaves in the temperament. */
    numberOfOctaves: number;

    /** Getter for the name of the temperament. */
    readonly name: string;
    /** Getter for the list of all of the frequencies in the temperament. */
    readonly freqs: number[];
    /** Getter for the list of generic note names. */
    readonly noteNames: string[];
    /** Getter for the number of notes defined per octave. */
    readonly numberOfSemitonesInOctave: number;
    /** Getter for the number of notes defined by the temperament. */
    readonly numberOfNotesInTemperament: number;

    /** Finds the index of the frequency nearest to the target. */
    getNearestFreqIndex: (target: number) => number;
    /** Returns the generic note name associated with an index. */
    getNoteName: (semitoneIndex: number) => string;
    /** Returns the index associated with a generic note name. */
    getModalIndex: (noteName: string) => number;
    /** Returns the frequency by an index into the frequency list. */
    getFreqByIndex: (pitchIndex: number) => number;
    /** Converts an index into the frequency list into a modal index and an octave. */
    getModalIndexAndOctaveFromFreqIndex: (pitchIndex: number) => [number, number];
    /** Returns the frequency that corresponds to the index and octave (in Hertz). */
    getFreqByModalIndexAndOctave: (modalIndex: number, octave: number) => number;
    getGenericNoteNameAndOctaveByFreqIndex: (idx: number) => [string, number];
    getFreqIndexByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;
    getFreqByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;

    /**
     * Creates one of the predefined temperaments based on the rules for generating the frequencies
     * and the selected intervals used to determine which frequencies to include in the temperament.
     */
    generate: (name: string) => void;
    generateEqualTemperament: (numberOfSteps: number) => void;
    generateCustom: (intervals: string[], ratios: { [key: string]: number }, name: string) => void;
    /** Calculates a base frequency based on a pitch and frequency. */
    tune: (pitchNameArg: string, octave: number, frequency: number) => number;
    /** Returns PitchTuple for a given frequency */
    frequencyToPitchOctaveCents: (frequency: number) => PitchTuple;
}
