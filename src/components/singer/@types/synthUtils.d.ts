/*
 * Copyright (c) 2021-23 Walter Bender. All rights reserved.
 * Copyright (c) 2021-23 Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

/** Interface for the SynthUtils class. */
export interface ISynthUtils {
    /**
     * @remarks
     * Returns a Tone.js synth for an instrument
     *
     * @param instrumentName is the name of a builtin synth (e.g., polySynth)
     *
     * @throws {InvalidArgumentError}
     */
    getBuiltinSynth: (instrumentName: string) => Tone.PolySynth | undefined;

    /**
     * @remarks
     * Returns a Tone.js synth for an instrument
     *
     * @param instrumentName is the name of a sample.
     *
     * @throws {InvalidArgumentError}
     */
    getSamplerSynth: (instrumentName: string) => Tone.Sampler | undefined;

    /**
     * @remarks
     * Returns a Tone.js synth for an instrument
     *
     * @param instrumentName is the name of a player.
     *
     * @throws {InvalidArgumentError}
     */
    getPlayerSynth: (instrumentName: string) => Tone.Player | undefined;

    /**
     * @remarks
     * Set the volume for a specific synth.
     *
     * @param volume from 0 to 100
     **/
    setVolume: (instrumentName: string, volume: number) => void;

    /**
     * @remarks
     * Set the master volume
     *
     * @param volume from 0 to 100
     **/
    setMasterVolume: (volume: number) => void;

    /**
     * @remarks
     * trigger pitch(es) on a synth for a specified note value.
     *
     * @param pitches is an array of pitches, e.g., ["c4", "g5"]
     * @param noteValueInSeconds is a note duration in seconds
     * @param instrumentName is the name of an instrument synth (either a sample or builtin)
     * @param offset is the time in seconds since the synth was started.
     *
     * @throws {InvalidArgumentError}
     */
    trigger: (
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string,
        offset: number
    ) => void;
}
