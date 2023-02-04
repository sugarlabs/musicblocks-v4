/*
 * Copyright (c) 2023, Walter Bender. All rights reserved.
 * Copyright (c) 2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** A tuple containing a noteValue and an array of pitches */
export type NoteTuple = [number, (string | number)[]];

/** Interface for the Voice class. */
export interface IVoice {
    /** Getter for the numberOfNotesPlayedInSeconds. */
    readonly numberOfNotesPlayedInSeconds: number;
    /** Getter for the list of notes played. */
    readonly notesPlayed: NoteTuple[];
    /** Notes played is the number of individual notes played */
    numberOfNotesPlayed: () => number;
    /** Notes played is the number of notes played by note value */
    getNumberOfNotesPlayedByNoteValue: (noteValue: number) => number;
    /** Getter and Setter for the beat. */
    beat: number;
    /** Getter and Setter for the beats per minute. */
    beatsPerMinute: number;
    /** Getter and Setter for the pickup */
    pickup: number;
    /** set the meter, e.g., 4:4 */
    setMeter: (
        beatsPerMeasure: number,
        noteValuePerBeat: number
    ) => void;
    /** Getter and Setter for the strong beats */
    strongBeats: number[];
    /** set a strong beat */
    setStrongBeat: (beat: number) => void;
    /** Getter and Setter for the weak beats */
    weakBeats: number[];
    /** set a weak beat */
    setWeakBeat: (beat: number) => void;
    /** Getter and Setter for beats per measure */
    beatsPerMeasure: number;
    /** Getter and Setter for note value per beat */
    noteValuePerBeat: number
    /** current beat */
    getCurrentBeat: () => number;
    /** current measure */
    getCurrentMeasure: () => number;
    /** Getter and Setter for the temporal offset */
    temporalOffset: number;
    /** Send notes to be played to the synth. */
    playNotes: (
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string,
        future: number,
        tally: boolean
    ) => void;
    /** Send one pitched note to the synth. */
    playNote: (
        pitche: (string|number),
        noteValue: number,
        instrumentName: string
    ) => void;
}
