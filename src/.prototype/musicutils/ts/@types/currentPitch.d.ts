/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** Interface for the CurrentPitch class. */
export interface ICurrentPitch {
    /** Getter for the frequency of the current note in Hertz. */
    readonly freq: number;
    /** Getter for the octave of the current note. */
    readonly octave: number;
    /** Getter for the generic name of the current note. */
    readonly genericName: string;
    /** Getter for that the modal index of the current note. */
    readonly semitoneIndex: number;
    /**
     * Getter for the index of the current note within the list of all of the notes defined by the
     * temperament.
     */
    readonly number: number;

    /** Sets current pitch to a new pitch by frequency, index and octave or name. */
    setPitch: (pitchName: number | string, octave: number) => void;
    /** Updates the current note by applying a semitone transposition. */
    applySemitoneTransposition: (numberOfHalfSteps: number) => void;
    /** Updates the current note by applying a scalar transposition. */
    applyScalarTransposition: (numberOfScalarSteps: number) => void;
    /** Calculates the frequency of the note numberOfHalfSteps away from the current note. */
    getSemitoneInterval: (numberOfHalfSteps: number) => number;
    /** Calculates the frequency of the note numberOfScalarSteps away from the current note. */
    getScalarInterval: (numberOfScalarSteps: number) => number;
}
