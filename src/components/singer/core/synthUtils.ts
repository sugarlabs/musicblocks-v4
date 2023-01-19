/*
 * Copyright (c) 2021-2023, Walter Bender. All rights reserved.
 * Copyright (c) 2021-2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import type { ISynthUtils } from '../@types/synthUtils';

import * as Tone from 'tone';

import { InvalidArgumentError } from './errors';
import { injected } from '..';

/**
 * Ensure the synthUtils component is ready.
 */
export function setupSynthUtils(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await Tone.start();
            console.log('audio is ready');
            resolve();
        })();
    });
}

/**
 * Predefined samples are data returned by a function. Each sample
 * has a center note and default volume; some samples are tonal,
 * meaning they are pitched; others, largely the percussion
 * samples, are not pitched. Pitched and unpitched samples use
 * different synth models (Sample vs Player).
 */
type SampleDict = {
    name: string;
    category: string;
    tonal: boolean;
    centerNote: string;
    defaultVolume: number;
    data: string;
};

/**
 * A synth is a built-in or sample used to create a sound.
 */
export default class SynthUtils implements ISynthUtils {
    /**
     * @remarks
     * The class variables maintain state.
     */
    builtinSynths: Map<string, Tone.PolySynth | undefined>;
    samplerSynths: Map<string, Tone.Sampler | undefined>;
    playerSynths: Map<string, Tone.Player | undefined>;
    samples: Record<string, SampleDict>;

    /**
     * Init the standard synths
     */
    constructor() {
        /**
         * @remarks
         * The constructor sets up the default set of synth.
         */
        this.builtinSynths = new Map();
        this.samplerSynths = new Map();
        this.playerSynths = new Map();

        this.builtinSynths.set("electronic synth", new Tone.PolySynth(Tone.Synth).toDestination());
        /** TODO: Add other builtin synths, e.g. noise, sin, etc. */

        /**
         * We enable a few samples by default.
         */
        this.samples = {};
        this.addSampleSynth('piano');
        this.addSampleSynth('guitar');
        this.addSampleSynth('snare');
    }

    /**
     * @remarks
     * Add a new sample synth.
     * 
     * @param sample name
     *     
     * @throws {InvalidArgumentError}
     */
    public addSampleSynth(sampleName: string) {
        if (sampleName in this.samples) {
            // Should we just warn or reject overwrites?
            console.warning('overwriting ' + sampleName);
        }
        try {
            this.samples[sampleName] = {
                data: injected.assets['audio.' + sampleName].data,
                ...injected.assets['audio.' + sampleName].meta,
            } as SampleDict;
        } catch (err) {
            console.err(err);
            throw new InvalidArgumentError(
                'cannot load sample synth ' + sampleName
            );
        }

        const _pitch = this.samples[sample]['centerNote'];
        this.samplerSynths.set(
            sampleName,
            new Tone.Sampler({
                _pitch: this.samples[sampleName]['data'],
            }),
        );
    }

    /**
     * @remarks
     * Get the synth for a given instrument name
     *
     * @param instrumentName is the name of a builtin synth (e.g., polySynth)
     *
     * @throws {InvalidArgumentError}
     */
    public getBuiltinSynth(instrumentName: string): Tone.PolySynth | undefined {
        if (instrumentName in this.builtinSynths) {
            return this.builtinSynths.get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find builtin synth');
    }
    /**
     * @remarks
     * Get the synth for a given instrument name
     *
     * @param instrumentName is the name of an instrument synth
     *
     * @throws {InvalidArgumentError}
     */
    public getSamplerSynth(instrumentName: string): Tone.Sampler | undefined {
        if (instrumentName in this.samplerSynths) {
            return this.samplerSynths.get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find sampler');
    }
    /**
     * @remarks
     * Get the synth for a given instrument name and instance.
     *
     * @param instrumentName is the name of a sample.
     *
     * @throws {InvalidArgumentError}
     */
    public getPlayerSynth(instrumentName: string): Tone.Player | undefined {
        if (instrumentName in this.playerSynths) {
            return this.playerSynths.get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find player');
    }

    /**
     * @remarks
     * Set the volume for a specific synth.
     *
     * @param volume from 0 to 100
     **/
    public setVolume(instrumentName: string, volume: number) {
        // We may adjust the relative volume of some Sampler synths.
        let nv;
        if (instrumentName in this.samples) {
            const sv = this.samples[instrumentName].defaultVolume;
            if (volume > 50) {
                const d = 100 - sv;
                nv = ((volume - 50) / 50) * d + sv;
            } else {
                nv = (volume / 50) * sv;
            }
        } else {
            nv = volume;
        }

        // Convert volume to decibals
        const db = Tone.gainToDb(nv / 100);
        // Find the synth and set the volume.
        if (instrumentName in this.builtinSynths) {
            const synth = this.builtinSynths.get(instrumentName);
            if (synth !== undefined) {
                synth.volume.value = db;
            }
        } else if (instrumentName in this.samplerSynths) {
            const synth = this.samplerSynths.get(instrumentName);
            if (synth !== undefined) {
                synth.volume.value = db;
            }
        } else if (instrumentName in this.playerSynths) {
            const synth = this.playerSynths.get(instrumentName);
            if (synth !== undefined) {
                synth.volume.value = db;
            }
        }
    }

    /**
     * @remarks
     * Set the master volume
     *
     * @param volume from 0 to 100
     **/
    public setMasterVolume(volume: number) {
        const db = Tone.gainToDb(volume / 100);
        Tone.Destination.volume.rampTo(db, 0.01);
    }

    /** TODO: Add effects */

    /**
     * @remarks
     * trigger pitch(es) on a synth for a specified note value.
     *
     * @param pitches is an array of pitches, e.g., ["c4", "g5"] or [440]
     * @param noteValueInSeconds is a note duration in seconds
     * @param instrumentName is the name of an instrument synth (either a sample or builtin)
     * @param offset is the time in seconds since the synth was started.
     *
     * @throws {InvalidArgumentError}
     */
    public trigger(
        pitches: (string|number)[],
        noteValueInSeconds: number,
        instrumentName: string,
        offset: number
    ) {
        const now = Tone.now();

        if (instrumentName in this.builtinSynths) {
            const synth = this.getBuiltinSynth(instrumentName);
            if (synth !== undefined) {
                synth.triggerAttackRelease(pitches, noteValueInSeconds, now + offset);
            }
        } else if (instrumentName in this.samplerSynths) {
            const synth = this.samplerSynths.get(instrumentName);
            if (synth !== undefined) {
                Tone.loaded().then(() => {
                    if (this.samples[instrumentName]['tonal']) {
                        synth.triggerAttackRelease(pitches, noteValueInSeconds, now + offset);
                    } else {
                        synth.triggerAttackRelease(this.samples[instrumentName]['centerNote'], noteValueInSeconds, now + offset);
                    }
                });
            }
        } else if (instrumentName in this.playerSynths) {
            const synth = this.playerSynths.get(instrumentName);
            if (synth !== undefined) {
                Tone.loaded().then(() => {
                    synth.start();
                });
            }
        } else {
            throw new InvalidArgumentError('cannot find instrument');
        }
    }
};
