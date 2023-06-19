/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { ICurrentPitch } from '../@types/currentPitch';
import Temperament from './temperament';
import KeySignature from './keySignature';
import { ItemNotFoundDefaultError } from './errors';

/**
 * Defines an object that manages pitch state.
 *
 * @remarks
 * A pitch is a note within a scale and temperament (tuning system).
 */
export default class CurrentPitch implements ICurrentPitch {
    /** The associated `Temperament` instance. */
    private _t: Temperament;
    /** The associated `KeySignature` instance. */
    private _ks: KeySignature;
    /** The frequency of the current note in Hertz. */
    private _freq: number;
    /**
     * The index of the current note within the list of all of the notes defined by the temperament.
     */
    private _number: number;
    /** The octave of the current note. */
    private _octave: number;
    /** The generic name of the current note. */
    public _genericName: string;
    /** The modal index of the current note. */
    private _semitoneIndex: number;

    /**
     * We need to define a key signature and temperament and a starting point within the scale (and
     * an initial octave value.
     *
     * @param keySignature - `KeySignature` object; defaults to KeySignature(key="c", mode="major").
     * @param temperament - `Temperament` object; defaults to Temperament(name="equal").
     * @param i - Index into semitones defined by temperament; defaults to `7`, which maps to g
     * (sol) in an equal temperament tuning.
     * @param octave - Initial octave for the pitch. Defaults to Octave 4.
     */
    constructor(keySignature?: KeySignature, temperament?: Temperament, i = 7, octave = 4) {
        this._t = temperament === undefined ? new Temperament() : temperament;
        this._ks =
            keySignature === undefined
                ? new KeySignature('major', 'c', this._t.numberOfSemitonesInOctave)
                : keySignature;
        this._semitoneIndex = i;
        this._octave = octave;

        this._genericName = this._t.getNoteName(this._semitoneIndex);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
        // console.log(this._genericName);

        // What is the absolute pitch number?
        this._number = this._octave * this._t.numberOfSemitonesInOctave + this._semitoneIndex;
    }

    /**
     * The frequency of the current note in Hertz.
     */
    public get freq(): number {
        return this._freq;
    }

    /**
     * The octave of the current note.
     */
    public get octave(): number {
        return this._octave;
    }

    /**
     * The generic name of the current note.
     */
    public get genericName(): string {
        return this._genericName;
    }

    /**
     * The modal index of the current note.
     */
    public get semitoneIndex(): number {
        return this._semitoneIndex;
    }

    /**
     * The index of the current note within the list of all of the notes defined by the temperament.
     */
    public get number(): number {
        return this._number;
    }

    /**
     * Defines the current pitch using a frequency.
     *
     * @param freq - The frequency used to define the current pitch.
     */
    private _defineByFrequency(freq: number): void {
        // Assume it is a frequency, and ignore the octave.
        this._number = this._t.getNearestFreqIndex(freq);
        // Do we force the pitch to be in the temperament?
        this._freq = this._t.getFreqByIndex(this._number);
        [this._semitoneIndex, this._octave] = this._t.getModalIndexAndOctaveFromFreqIndex(
            this._number,
        );
        this._genericName = this._t.getNoteName(this._semitoneIndex);
    }

    /**
     * Sets current pitch to a new pitch by frequency, index and octave or name. These internal
     * states are updated: freq, semitoneIndex, genericName, octave, and number.
     *
     * @param pitchName - The new pitch as a frequency (float), or a modal index (int) and octave or
     * note name (str) and octave. Note names can be "n7", "g", "sol", or, if defined, a custom name.
     * @param octave - The new octave (not needed when pitch is specified by frequency).
     */
    public setPitch(pitchName: number | string, octave = 4): void {
        if (typeof pitchName === 'number') {
            // pitchName is float
            if (pitchName % 1 !== 0) {
                this._defineByFrequency(pitchName);
            }
            // pitchName is int
            else {
                /*
                 * A few assumptions here: If the int > number of defined in the temperament, assume
                 * it is a frequency. If the int < number of semitones in an octave, assume it is a
                 * semitone index. Otherwise, assume it is an index in the list of frequencies (a
                 * pitch number).
                 */
                if (pitchName > this._t.numberOfNotesInTemperament) {
                    this._defineByFrequency(pitchName);
                } else if (pitchName > this._t.numberOfSemitonesInOctave) {
                    // Assume it is a pitch number.
                    this._number = pitchName;
                    this._freq = this._t.getFreqByIndex(this._number);
                    [this._semitoneIndex, this._octave] =
                        this._t.getModalIndexAndOctaveFromFreqIndex(this._number);
                    this._genericName = this._t.getNoteName(this._semitoneIndex);
                } else {
                    // Assume it is a semitone index.
                    this._semitoneIndex = pitchName;
                    this._octave = octave;
                    this._genericName = this._t.getNoteName(this._semitoneIndex);
                    this._freq = this._t.getFreqByModalIndexAndOctave(
                        this._semitoneIndex,
                        this._octave,
                    );
                    this._number = this._t.getNearestFreqIndex(this._freq);
                }
            }
        } else if (typeof pitchName === 'string') {
            // Assume it is a name of some sort.
            try {
                this._genericName = this._ks.convertToGenericNoteName(pitchName);
            } catch (err) {
                this._genericName = (err as ItemNotFoundDefaultError<string>).defaultValue;
            }
            this._semitoneIndex = this._t.getModalIndex(this._genericName);
            this._octave = octave;
            this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
            this._number = this._t.getNearestFreqIndex(this._freq);
        }
    }

    /**
     * Updates the current note by applying a semitone transposition. These internal states are
     * updated: freq, semitoneIndex, genericName, octave, and number.
     *
     * @param numberOfHalfSteps - The transposition in half steps.
     */
    public applySemitoneTransposition(numberOfHalfSteps: number): void {
        let genericName: string;
        let deltaOctave: number;
        try {
            [genericName, deltaOctave] = this._ks.semitoneTransform(
                this._genericName,
                numberOfHalfSteps,
            );
        } catch (err) {
            [genericName, deltaOctave] = (
                err as ItemNotFoundDefaultError<[string, number]>
            ).defaultValue;
        }

        this._genericName = genericName;
        this._octave += deltaOctave;
        this._semitoneIndex = this._t.getModalIndex(this._genericName);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
        this._number = this._t.getNearestFreqIndex(this._freq);
    }

    /**
     * Updates the current note by applying a scalar transposition. These internal states are
     * updated: freq, semitoneIndex, genericName, octave, and number.
     *
     * @param numberOfScalarSteps - The transposition in scalar steps.
     */
    public applyScalarTransposition(numberOfScalarSteps: number): void {
        const [_genericName, deltaOctave] = this._ks
            .scalarTransform(this._genericName, numberOfScalarSteps)
            .slice(0, 2) as [string, number];
        this._genericName = _genericName;
        this._octave += deltaOctave;
        this._semitoneIndex = this._t.getModalIndex(this._genericName);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
        this._number = this._t.getNearestFreqIndex(this._freq);
    }

    /**
     * Calculates the frequency of the note numberOfHalfSteps away from the current note.
     *
     * @param numberOfHalfSteps - The interval in half steps.
     * @returns The frequency of the note at the specified interval.
     */
    public getSemitoneInterval(numberOfHalfSteps: number): number {
        let genericName: string;
        let deltaOctave: number;
        try {
            [genericName, deltaOctave] = this._ks.semitoneTransform(
                this._genericName,
                numberOfHalfSteps,
            );
        } catch (err) {
            [genericName, deltaOctave] = (
                err as ItemNotFoundDefaultError<[string, number]>
            ).defaultValue;
        }

        const semitoneIndex = this._t.getModalIndex(genericName);
        const octave = this._octave + deltaOctave;
        return this._t.getFreqByModalIndexAndOctave(semitoneIndex, octave);
    }

    /**
     * Calculates the frequency of the note numberOfScalarSteps away from the current note.
     *
     * @param numberOfScalarSteps - The interval in scalar steps.
     * @returns The frequency of the note at the specified interval.
     */
    public getScalarInterval(numberOfScalarSteps: number): number {
        const [genericName, deltaOctave] = this._ks
            .scalarTransform(this._genericName, numberOfScalarSteps)
            .slice(0, 2) as [string, number];
        const semitoneIndex = this._t.getModalIndex(genericName);
        const octave = this._octave + deltaOctave;
        return this._t.getFreqByModalIndexAndOctave(semitoneIndex, octave);
    }

    /**
     * Returns the generic note name and the frequency of the current pitch.
     * @override
     */
    public toString(): string {
        return `${this._genericName} ${this._freq}`;
    }
}
