/*
 * Copyright (c) 2021-23 Walter Bender. All rights reserved.
 * Copyright (c) 2021-23 Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** Interface for the SynthUtils class. */
export interface ISynthUtils {
    /**
     * Returns a Tone.js synth for an instrument
     * @throws {InvalidArgumentError}
     */
    getBuiltinSynth: (instrumentName: string, instance: number) => Tone.PolySynth | undefined;
    /**
     * Returns a Tone.js synth for an instrument
     * @throws {InvalidArgumentError}
     */
    getSampler: (instrumentName: string, instance: number) => Tone.Sampler | undefined;
    /**
     * Returns a Tone.js synth for an instrument
     * @throws {InvalidArgumentError}
     */
    getPlayer: (instrumentName: string, instance: number) => Tone.Player | undefined;
    /**
     * Adds a new voice instance with that voice's synths and status
     */
    addVoice: (instance: number) => void;
    /**
     * Returns note value in seconds
     */
    noteValueToSeconds: (noteValue: number, instance: number) => number;
    /**
     * Plays a note.
     * @throws {InvalidArgumentError}
     */
    trigger: (
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string,
        instance: number
    ) => void;
}
