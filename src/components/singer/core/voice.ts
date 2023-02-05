/*
 * Copyright (c) 2023, Walter Bender. All rights reserved.
 * Copyright (c) 2023, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import type { IVoice, NoteTuple } from '../@types/voice';

import SynthUtils from './synthUtils';
import { validatePitch } from './musicUtils';
import { InvalidArgumentError } from './errors';


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
    private _numberOfQuarterNotesPlayed: number;
    private _numberOfQuarterNotesPlayedInMeter: number;
    private _beat: number;
    private _beatsPerMinute: number;
    private _volume: number;
    private _notesPlayed: NoteTuple[];
    private _temporalOffset: number;
    private _synthUtils: SynthUtils | null;
    private _pickup: number;
    private _pickupInMeter: number;
    private _beatsPerMeasure: number;
    private _noteValuePerBeat: number;
    private _currentBeat: number;
    private _currentMeasure: number;
    private _previousMeasures: number;
    private _strongBeats: number[];
    private _weakBeats: number[];

    /**
     * Init the state for this voice.
     *
     * @params
     * synthUtils is the common instance of synthUtils used by all voices.
     */
    constructor(synthUtils: SynthUtils | null) {
        /**
         * @remarks
         * The constructor registers the voice with SynthUtils.
         */
        this._synthUtils = synthUtils;

        /** In order to sync voices, we may neetd to introduce an offset. */
        this._temporalOffset = 0;

        /** A list of all of the notes played by this voice. */
        this._notesPlayed = [];

        /**
         * We need to keep track of time: when did the first
         * note start to play, the beat unit, e.g., 1/4 note, and the
         * beats per minute.
         */
        this._numberOfNotesPlayedInSeconds = 0;
        this._numberOfQuarterNotesPlayed = 0;
        this._beat = 1 / 4;
        this._beatsPerMinute = 90;

        /** Parameters used in time signature */
        this._pickup = 0;
        this._pickupInMeter = 0;
        this._numberOfQuarterNotesPlayedInMeter = 0;
        this._beatsPerMeasure = 4;
        this._noteValuePerBeat = 1 / 4;
        this._currentBeat = 0;
        this._currentMeasure = 0;
        this._previousMeasures = 0;
        this._strongBeats = [0, 2];
        this._weakBeats = [1, 3];

        /** We also track attributes such as a master volume. */
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
    public set beat(beat: number) {
        this._beat = beat;
    }

    public get beat(): number {
        return this._beat;
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
     * Number of notes played in note value is calcualted based on the beatValue.
     * @param noteValue is a note value, e.g. 1/4 for a quarternote.
     */
    public getNumberOfNotesPlayedByNoteValue(noteValue: number): number {
        if (noteValue <= 0) {
            throw new InvalidArgumentError('noteValue must be > 0');
        }
        return this._numberOfQuarterNotesPlayed * (1/4) / noteValue;
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

    /**
     * @remarks
     * TemporalOffset is used to sync voices.
     */
    public set temporalOffset(temporalOffset: number) {
        this._temporalOffset = temporalOffset;
    }

    public get temporalOffset(): number {
        return this._temporalOffset;
    }
 
    /**
     * @remarks
     * pickup is used to provide an offset for the starting measure.
     * pickup is expressed in terms of notes, e.g., 3/4 for 3 quarter notes.
     */
    public set pickup(pickup: number) {
        if (pickup < 0) {
            throw new InvalidArgumentError('pickup must be >= 0');
        }
        this._pickup = pickup;
        this._pickupInMeter = pickup;
    }

    public get pickup(): number {
        return this._pickup;
    }
 
    /**
     * @remarks
     * set the beats per measure, note value per beat and
     * default values for the strong and weak beats.
     * @param beatsPerMeasure is the beatsPerMeasure.
     * @param noteValuePerBeat is the note value per beat.
     */
    public setMeter(beatsPerMeasure: number, noteValuePerBeat: number) {
        if (beatsPerMeasure < 1) {
            throw new InvalidArgumentError('beatsPerMeasure must be >= 1');
        }
        if (noteValuePerBeat <= 0) {
            throw new InvalidArgumentError('noteValuePerBeat must be > 0');
        }

        /** We need to start the count anew after each meter change */
        this._numberOfQuarterNotesPlayedInMeter = 0;
        this._previousMeasures += this._currentMeasure;
        this._currentMeasure = 0;
        if (
               (this._numberOfQuarterNotesPlayed * (1/4) / this._noteValuePerBeat)
               >= this._pickupInMeter
           ) {
            this._pickupInMeter = 0;
        }

        this._beatsPerMeasure = beatsPerMeasure <= 0 ? 4 : beatsPerMeasure;
        this._noteValuePerBeat = noteValuePerBeat <= 0 ? 1 / 4 : noteValuePerBeat;

        /** Default values for strong and weak beats */
        if (this._beatsPerMeasure === 4) {
            this._strongBeats = [0, 2];
            this._weakBeats = [1, 3];
        } else if (this._beatsPerMeasure === 2) {
            this._strongBeats = [0];
            this._weakBeats = [1];
        } else if (this._beatsPerMeasure === 3) {
            this._strongBeats = [0];
            this._weakBeats = [1, 2];
        } else if (this._beatsPerMeasure === 6) {
            this._strongBeats = [0, 3];
            this._weakBeats = [1, 2, 4, 5];
        } else {
            this._strongBeats = [0];
            this._weakBeats = [];
            for (let i = 1; i < this._beatsPerMeasure; i++) {
                this._weakBeats.push(i);
            }
        }
    }

    /**
     * @param strongBeats[] is an array of the strong beats in a measure
     */
    public set strongBeats(beats: number[]) {
        this._strongBeats = beats;
    }

    public get strongBeats(): number[] {
        return this._strongBeats;
    }

    /**
     * @param beat to add to strong beat array
     */
    public setStrongBeat(beat: number) {
        let i = this._strongBeats.indexOf(beat);
        if (i === -1) {
            this._strongBeats.push(beat);
        }
        i = this._weakBeats.indexOf(beat);
        if (i !== -1) {
            this._weakBeats.splice(i, 1);
        }
    }

    /**
     * @param beat to add to weak beat array
     */
    public setWeakBeat(beat: number) {
        let i = this._weakBeats.indexOf(beat);
        if (i === -1) {
            this._weakBeats.push(beat);
        }
        i = this._strongBeats.indexOf(beat);
        if (i !== -1) {
            this._strongBeats.splice(i, 1);
        }
    }

    /**
     * @param weakBeats[] is an array of the weak beats in a measure
     */
    public set weakBeats(beats: number[]) {
        this._weakBeats = beats;
    }

    public get weakBeats(): number[] {
        return this._weakBeats;
    }

    /**
     * @remarks
     * beatsPerMeasure is the number of beats per measure
     * (e.g. the 3 in 3:4 time).
     */
    public set beatsPerMeasure(beatsPerMeasure: number) {
        this._beatsPerMeasure = beatsPerMeasure <= 0 ? 4 : beatsPerMeasure;
    }

    public get beatsPerMeasure(): number {
        return this._beatsPerMeasure;
    }

    /**
     * @remarks
     * noteValuePerBeat is the value of a beat ins a measure.
     * (e.g. the 4 in 3:4 time).
     * @param noteValuePerBeat is expressed as a fraction, e.g. 1/4 for a quarter note.
     */
    public set noteValuePerBeat(noteValuePerBeat: number) {
        this._noteValuePerBeat = noteValuePerBeat <= 0 ? 1 / 4 : noteValuePerBeat;
    }

    public get noteValuePerBeat(): number {
        return this._noteValuePerBeat;
    }
 
    /** What beat are we on? */
    public getCurrentBeat(): number {
        return this._currentBeat;
    }

    /** What measure are we in? */
    public getCurrentMeasure(): number {
        return this._currentMeasure;
    }

    private _updateCurrentBeat() {
        this._currentBeat = (
            (this._numberOfQuarterNotesPlayed * (1/4) / this._noteValuePerBeat)
            - this._pickupInMeter
        ) % this._beatsPerMeasure;
    }

    private _updateCurrentMeasure() {
        if (
               (this._numberOfQuarterNotesPlayed * (1/4) / this._noteValuePerBeat)
               < this._pickupInMeter
           ) {
            this._currentMeasure = 0;
        } else {
            this._currentMeasure = Math.floor (
                (
                   (this._numberOfQuarterNotesPlayedInMeter * (1/4) / this._noteValuePerBeat)
                   - this._pickupInMeter
                ) / this._beatsPerMeasure
            ) + 1 + this._previousMeasures;
        }
    }

    /** TODO: onEveryBeatDo, onEveryStrongBeatDo, onEveryWeakBeatDo, onEveryNoteDo */

    /** TODO: Volume */

    /**
      * @remarks
      * trigger pitch(es) on a synth for a specified note value.
      *
      * @param pitches is an array of pitches, e.g., ["c4", "g5", 440]
      * @param noteValue is a note duration, e.g., 1/4
      * @param instrumentName is the name of an instrument synth (either a sample or builtin)
      * @param future is a temportal offset into the future (default is 0)
      * @param tally is a flag to enable/disable tallying (default is true)
      *
      * @throws {InvalidArgumentError}
      */
    public playNotes(
        pitches: (string|number)[],
        noteValue: number,
        instrumentName: string,
        future: number,
        tally: boolean
    ) {
        /**
         * We calculate an offset based on how many notes we have already played.
         */
        const noteValueInSeconds = this.noteValueToSeconds(noteValue);
        for (let i = 0; i < pitches.length; i++) {
            validatePitch(pitches[i]);
        }

        if (future < 0) {
            throw new InvalidArgumentError('future cannot be negative');
        }

        if (this._synthUtils !== null) {
            this._synthUtils.trigger(
                pitches,
                noteValue,
                instrumentName,
                this._numberOfNotesPlayedInSeconds + this._temporalOffset + future
            );
        }

        if (tally) {
            this._numberOfNotesPlayedInSeconds += noteValueInSeconds;
            this._numberOfQuarterNotesPlayed += noteValue / (1 / 4);
            this._numberOfQuarterNotesPlayedInMeter += noteValue / (1 / 4);
            this._notesPlayed.push([noteValue, pitches]);
            this._updateCurrentBeat();
            this._updateCurrentMeasure();
        }
    }

    /**
      * @remarks
      * trigger pitch(es) on a synth for a specified note value.
      *
      * @param pitch is single pitch, e.g., "c4", "g5", or 440
      * @param noteValue is a note duration, e.g., 1/4
      * @param instrumentName is the name of an instrument synth (either a sample or builtin)
      */
    public playNote(
        pitch: (string|number),
        noteValue: number,
        instrumentName: string,
    ) {
        this.playNotes([pitch], noteValue, instrumentName, 0, true);
    }
};
