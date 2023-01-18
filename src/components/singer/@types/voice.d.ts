/*
 * Copyright (c) 2023, Walter Bender. All rights reserved.
 * Copyright (c) 2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

export type NoteTuple = [number, (string | number)[]];

/** Interface for the Voice class. */
export interface IVoice {
    /** Getter and Setter for the beat. */
    beat: number;
    /** Getter and Setter for the beats per minute. */
    beatsPerMinute: number;
    /** Getter for the numberOfNotesPlayedInSeconds. */
    readonly numberOfNotesPlayedInSeconds: number;
    /** Getter for the list of notes played. */
    readonly notesPlayed: NoteTuple[];
    /** Notes played is the number of individual notes played */
    numberOfNotesPlayed: () => number;
    /** Send notes to be played to the synth. */
    playNotes: (
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string
    ) => void;
}
