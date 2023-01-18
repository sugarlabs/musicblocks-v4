/*
 * Copyright (c) 2023, Walter Bender. All rights reserved.
 * Copyright (c) 2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import type { IVoice, NoteTuple } from '../@types/voice';

import SynthUtils from './synthUtils';
import { validatePitch } from './musicUtils';

/**
 * The Voice class manages characteristics such as notes being played for a
 * "voice" (one of many parallel threads) in Music Blocks.
 */
export class Voice implements IVoice {
    /**
     * @remarks
     * The class variables maintain state.
     */
    private _numberOfNotesPlayedInSeconds: number;
    private _beat: number;
    private _beatsPerMinute: number;
    private _volume: number;
    private _notesPlayed: NoteTuple[];
    private _synthUtils: SynthUtils;

    /**
     * Init the synths for voice 0
     *
     * @params
     * synthUtils is the common instance of synthUtils used by all voices.
     */
    constructor(synthUtils: SynthUtils) {
        /**
         * @remarks
         * The constructor registers the voice with SynthUtils.
         */
         this._synthUtils = synthUtils;

        /**
         * We need to keep track of time: when did the first
         * note start to play, the beat unit, e.g., 1/4 note, and the
         * beats per minute.
        */
        this._numberOfNotesPlayedInSeconds = 0;
        this._beat = 1 / 4;
        this._beatsPerMinute = 90;
        this._notesPlayed = [];
        /**
         * We also track attributes such as a master volume.
         */
        this._volume = 50;
    }

    /**
     * Convert from note value to seconds
     *
     * @param noteValue - 1/4, 1/8 etc.
     **/
    private noteValueToSeconds(noteValue: number): number {
        return (60 / this._beatsPerMinute) * (noteValue / this._beat);
    }

    /**
     * @remarks
     * Beat is the unit used for the beat, e.g., 1/4 for a quarter note
     */
    public get beat(): number {
        return this._beat;
    }
 
    public set beat(beat: number) {
        this._beat = beat;
    }

    /**
     * @remarks
     * Beats per minute is the number of beats played in a minute, e.g., 90
     */
    public get beatsPerMinute(): number {
        return this._beatsPerMinute;
    }

    public set beatsPerMinute(beatsPerMinute: number) {
        this._beatsPerMinute = beatsPerMinute;
    }

    /**
     * @remarks
     * Number of notes played in seconds is the accumulated time
     */
    public get numberOfNotesPlayedInSeconds(): number {
        return this._numberOfNotesPlayedInSeconds;
    }

    /**
     * @remarks
     * Noted played is a list of all of the notes played
     */
    public get notesPlayed(): NoteTuple[] {
        return this._notesPlayed;
    }

    /**
     * @remarks
     * Notes played is the number of individual notes played
     */
    public numberOfNotesPlayed(): number {
        return this._notesPlayed.length;
    }

    /** TODO: Volume */

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
    public playNotes(
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string
    ) {
        /**
         * We calculate an offset based on how many notes we have already played.
         */
        const noteValueInSeconds = this.noteValueToSeconds(noteValue);
        for (let i = 0; i < pitches.length; i++) {
            validatePitch(pitches[i]);
        }

        this._synthUtils.trigger(
            pitches,
            noteValue,
            instrumentName,
            this._numberOfNotesPlayedInSeconds
        );
        this._numberOfNotesPlayedInSeconds += noteValueInSeconds;
        this._notesPlayed.push([noteValue, pitches]);
    }
};
