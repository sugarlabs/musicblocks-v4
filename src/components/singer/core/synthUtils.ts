/*
 * Copyright (c) 2021-2023, Walter Bender. All rights reserved.
 * Copyright (c) 2021-2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { ISynthUtils } from '../@types/synthUtils';
import { InvalidArgumentError } from './errors';
import { validatePitch } from './musicUtils';
import * as Tone from 'tone';
import { piano } from '../samples/piano';
import { guitar } from '../samples/guitar';
import { snare } from '../samples/snare';

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
    samples: Record<string, SampleDict>;
    builtinSynths: Record<string, Map<string, Tone.PolySynth | undefined>>;
    samplers: Record<string, Map<string, Tone.Sampler | undefined>>;
    players: Record<string, Map<string, Tone.Player | undefined>>;
    notesPlayed: Record<string, number> = {};
    beat: Record<string, number> = {};
    beatsPerMinute: Record<string, number> = {};

    /**
     * Init the synths for voice 0
     */
    constructor() {
        /**
         * @remarks
         * The constructor sets up Voice 0
         */
        this.builtinSynths = {};
        this.samplers = {};
        this.players = {};

        /**
         * We need an instance of each synth per "voice" so that we can
         * maintain different volume settings.
         */
        this.samples = {};

        /**
         * ADD NEW SAMPLE NAMES HERE.
         */
        this.samples['piano'] = piano;
        this.samples['guitar'] = guitar;
        this.samples['snare'] = snare;

        /**
         * Create the synth instances for the default (0) voice.
         */
        this.addVoice(0);
    }

    private _addSynths(instance: number) {
        const instanceName = instance.toString();
        const builtinSynthMap = new Map<string, Tone.PolySynth | undefined>();
        const samplerMap = new Map<string, Tone.Sampler | undefined>();
        const playerMap = new Map<string, Tone.Player | undefined>();

        let _synth;
        /** TODO: add other builtin synths **/
        _synth = new Tone.PolySynth(Tone.Synth).toDestination();
        builtinSynthMap.set("electronic synth", _synth);

        for (const sample in this.samples) {
            const _pitch = this.samples[sample]['centerNote'];
            _synth = new Tone.Sampler({ _pitch: this.samples[sample]['data'] });
            samplerMap.set(sample, _synth);
            // } else {
            //    _synth = new Tone.Player(this.samples[sample]['data']);
            //     playerMap.set(sample, _synth);
            // }
        }

        this.builtinSynths[instanceName] = builtinSynthMap;
        this.samplers[instanceName] = samplerMap;
        this.players[instanceName] = playerMap;
    }

    /**
      * @remarks
      * Get the synth for a given instrument name and instance.
      *
      * @param instrumentName is the name of a builtin synth (e.g., polySynth)
      * @param instance is the voice number associated with the synth
      *
      * @throws {InvalidArgumentError}
      */
    public getBuiltinSynth(instrumentName: string, instance: number): Tone.PolySynth | undefined {
        const instanceName = instance.toString();
        if (instrumentName in this.builtinSynths[instanceName]) {
            return this.builtinSynths[instanceName].get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find builtin synth');
    }
    /**
      * @remarks
      * Get the synth for a given instrument name and instance.
      *
      * @param instrumentName is the name of an instrument synth
      * @param instance is the voice number associated with the synth
      *
      * @throws {InvalidArgumentError}
      */
    public getSampler(instrumentName: string, instance: number): Tone.Sampler | undefined {
        const instanceName = instance.toString();
        if (instrumentName in this.samplers[instanceName]) {
            return this.samplers[instanceName].get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find sampler');
    }
    /**
      * @remarks
      * Get the synth for a given instrument name and instance.
      *
      * @param instrumentName is the name of a sample.
      * @param instance is the voice number associated with the synth
      *
      * @throws {InvalidArgumentError}
      */
    public getPlayer(instrumentName: string, instance: number): Tone.Player | undefined {
        const instanceName = instance.toString();
        if (instrumentName in this.players[instanceName]) {
            return this.players[instanceName].get(instrumentName);
        }
        throw new InvalidArgumentError('cannot find player');
    }

    /**
      * @remarks
      * Creates synths for a new voice (if it doesn't already exist)
      * and sets the default values for the voice parameters.
      */
    public addVoice(instance: number) {
        const instanceName = instance.toString();

        /**
         * We need to keep track of time: when did the first
         * note start to play, the beat unit, e.g., 1/4 note, and the
         * beats per minute.
        */
        this.notesPlayed[instanceName] = 0;
        this.beat[instanceName] = 1 / 4;
        this.beatsPerMinute[instanceName] = 90;

        /**
         * If the instance already exists, don't reload the synths.
         */
        if (instanceName in this.builtinSynths) {
            return;
        };
        this._addSynths(instance);
    }

    /**
     * Convert from note value to seconds
     *
     * @param noteValue - 1/4, 1/8 etc.
     * @param instance is needed for accessing the beat information
     **/
    public noteValueToSeconds(noteValue: number, instance: number): number {
        const instanceName = instance.toString();
        return (60 / this.beatsPerMinute[instanceName]) * (noteValue / this.beat[instanceName]);
    }

    /** TODO: ADD GETTERS/SETTERS for beat, et al. */
    /** TODO: Volume */
    /** TODO: Add effects */
    /** TODO: Add other builtin synths, e.g. noise, sin, etc.

    /**
      * @remarks
      * trigger pitch(es) on a synth for a specified note value.
      *
      * @param pitches is an array of pitches, e.g., ["c4", "g5"]
      * @param noteValue is a note duration, e.g., 1/4
      * @param instrumentName is the name of an instrument synth (either a sample or builtin)
      * @param instance is the voice number associated with the instrument synth
      *
      * @throws {InvalidArgumentError}
      */
    public trigger(
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string,
        instance: number
    ) {
        const instanceName = instance.toString();
        const now = Tone.now();
        /**
         * We calculate an offset based on how many notes we have already played.
         */
        const offset = this.noteValueToSeconds(this.notesPlayed[instance], instance);
        const noteValueInSeconds = this.noteValueToSeconds(noteValue, instance);

        /** Validate the pitches. (maybe move to musicUtils?) */
        for (let i = 0; i < pitches.length; i++) {
            validatePitch(pitches[i]);
        }

        if (instrumentName in this.builtinSynths[instanceName]) {
            const _synth = this.builtinSynths[instanceName].get(instrumentName);
            if (_synth !== undefined) {
                console.log(typeof(_synth));
                _synth.triggerAttackRelease(pitches, noteValueInSeconds, now + offset);
            }
        } else if (instrumentName in this.samplers[instanceName]) {
            const _synth = this.samplers[instanceName].get(instrumentName);
            if (_synth !== undefined) {
                console.log(typeof(_synth));
                Tone.loaded().then(() => {
                    if (this.samples[instrumentName]['tonal']) {
                        _synth.triggerAttackRelease(pitches, noteValueInSeconds, now + offset);
                    } else {
                        _synth.triggerAttackRelease(this.samples[instrumentName]['centerNote'], noteValueInSeconds, now + offset);
                    }
                });
            }
        } else if (instrumentName in this.players[instanceName]) {
            const _synth = this.players[instanceName].get(instrumentName);
            if (_synth !== undefined) {
                console.log(typeof(_synth));
                Tone.loaded().then(() => {
                    _synth.start();
                });
            }
        } else {
            throw new InvalidArgumentError('cannot find instrument');
        }

        this.notesPlayed[instanceName] += noteValueInSeconds;
    }
};
