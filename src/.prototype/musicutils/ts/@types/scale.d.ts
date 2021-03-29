/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** Interface for the Scale class. */
export interface IScale {
    /** Getter for the number of notes in the scale. */
    readonly numberOfSemitones: number;
    /** Getter for the notes defined by the temperament. */
    readonly noteNames: string[];

    /**
     * Returns the notes in the scale.
     * @throws {InvalidArgumentError}
     */
    getScale: (pitchFormat?: string[]) => string[];
    /**
     * Returns the notes in the scale and the octave deltas.
     * @throws {InvalidArgumentError}
     */
    getScaleAndOctaveDeltas: (pitchFormat?: string[]) => [string[], number[]];
}
