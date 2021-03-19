/*
The Current Pitch class defines an object that manages pitch state.
*/

// Copyright (c) 2021 Walter Bender, Sugar Labs

// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.

// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

import Temperament from './temperament';
import KeySignature from './keySignature';
import ICurrentPitch from './@types/currentPitch';

// from temperament import Temperament
// from keysignature import KeySignature

export default class CurrentPitch implements ICurrentPitch {
    /*
    A pitch is a note within a scale and temperament (tuning system).
    */

    private _freq: number;
    private _number: number;
    private _t: Temperament;
    private _octave: number;
    private _ks: KeySignature;
    private _genericName: string;
    private _semitoneIndex: number;

    /**
     * We need to define a key signature and temperament and a starting
        point within the scale (and an initial octave value.
     * @param keysignature - KeySignature object; defaults to KeySignature(key="c", mode="major")
     * @param temperament - Temperament object; defaults to Temperament(name="equal")
     * @param i - Index into semitones defined by temperament; defaults to 7, which
            maps to g (sol) in an equal temperament tuning
     * @param octave - Initial octave for the pitch. Defaults to Octave 4
     */
    constructor(
        keysignature: any = null,
        temperament: Temperament = null,
        i: number = 7,
        octave: number = 4
    ) {
        if (!temperament) {
            this._t = new Temperament();
        } else {
            this._t = temperament;
        }

        if (!keysignature) {
            this._ks = new KeySignature('major', 'c', this._t.numberOfSemitonesInOctave);
        } else {
            this._ks = keysignature;
        }

        this._semitoneIndex = i;
        this._octave = octave;

        this._genericName = this._t.getNoteName(this._semitoneIndex);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);

        // What is the absolute pitch number?
        this._number = this._octave * this._t.numberOfSemitonesInOctave + this._semitoneIndex;
    }

    private _defineByFrequency(freq: any): void {
        // Assume it is a frequency, and ignore the octave.
        this._number = this._t.getNearestFreqIndex(freq);
        // Do we force the pitch to be in the temperament?
        this._freq = this._t.getFreqByIndex(this._number);
        const [_semitoneIndex, _octave] = this._t.getModalIndexAndOctaveFromFreqIndex(this._number);
        this._semitoneIndex = _semitoneIndex;
        this._octave = _octave;
        this._genericName = this._t.getNoteName(this._semitoneIndex);
    }

    /**
     * Set current pitch to a new pitch by frequency, index and octave or
        name. These internal states are updates: freq, semitoneIndex,
        genericName, octave, and number.
     * @param pitchName - The new pitch as a frequency (float), or a modal index (int) and
            octave or note name (str) and octave.
            Note names can be "n7", "g", "sol", or, if defined, a custom name.
     * @param octave - The new octave (not needed when pitch is specified by frequency)
     */
    setPitch(pitchName: number | string, octave: number = 4): void {
        if (typeof pitchName === 'number') {
            this._defineByFrequency(pitchName);
        } else if (typeof pitchName === 'number') {
            // A few assumptions here: If the int > number of defined
            // in the temperament, assume it is a frequency.  If the
            // int < number of semitones in an octave, assume it is a
            // semitone index.  Otherwise, assume it is an index in the
            // list of frequencies (a pitch number).
            if (pitchName > this._t.numberOfNotesInTemperament) {
                this._defineByFrequency(pitchName);
            } else if (pitchName > this._t.numberOfSemitonesInOctave) {
                // Assume it is a pitch number
                this._number = pitchName;
                this._freq = this._t.getFreqByIndex(this._number);
                const [_semitoneIndex, _octave] = this._t.getModalIndexAndOctaveFromFreqIndex(
                    this._number
                );
                this._semitoneIndex = _semitoneIndex;
                this._octave = _octave;
                this._genericName = this._t.getNoteName(this._semitoneIndex);
            } else {
                // Assume it is a semitone index.
                this._semitoneIndex = pitchName;
                this._octave = octave;
                this._genericName = this._t.getNoteName(this._semitoneIndex);
                this._freq = this._t.getFreqByModalIndexAndOctave(
                    this._semitoneIndex,
                    this._octave
                );
                this._number = this._t.getNearestFreqIndex(this._freq);
            }
        } else if (typeof pitchName === 'string') {
            // Assume it is a name of some sort.
            this._genericName = this._ks.convertToGenericNoteName(pitchName)[0];
            this._semitoneIndex = this._t.getModalIndex(this._genericName);
            this._octave = octave;
            this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
            this._number = this._t.getNearestFreqIndex(this._freq);
        }
    }

    /**
     * Update the current note by applying a semitone transposition.
        These internal states are updates: freq, semitoneIndex,
        genericName, octave, and number.
     * @param numberOfHalfSteps - The transposition in half steps
     */
    applySemitoneTransposition(numberOfHalfSteps: number): void {
        const [_genericName, deltaOctave] = this._ks
            .semitoneTransform(this._genericName, numberOfHalfSteps)
            .slice(0, 2);
        this._genericName = _genericName;
        this._octave += deltaOctave;
        this._semitoneIndex = this._t.getModalIndex(this._genericName);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
        this._number = this._t.getNearestFreqIndex(this._freq);
    }

    /**
     * Update the current note by applying a scalar transposition.
        These internal states are updates: freq, semitoneIndex,
        genericName, octave, and number.
     * @param numberOfScalarSteps - The transposition in scalar steps
     */
    applyScalarTransposition(numberOfScalarSteps: number): void {
        const [_genericName, deltaOctave] = this._ks
            .scalarTransform(this._genericName, numberOfScalarSteps)
            .slice(0, 2);

        this._genericName = _genericName as string;
        this._octave += deltaOctave as number;
        this._semitoneIndex = this._t.getModalIndex(this._genericName);
        this._freq = this._t.getFreqByModalIndexAndOctave(this._semitoneIndex, this._octave);
        this._number = this._t.getNearestFreqIndex(this._freq);
    }

    /**
     * Calculate the frequency of the note numberOfHalfSteps
        away from the current note.
     * @param numberOfHalfSteps - The interval in half steps
     * @returns - The frequency of the note at the specified interval.
     */
    getSemitoneInterval(numberOfHalfSteps: number): number {
        const [genericName, deltaOctave] = this._ks
            .semitoneTransform(this._genericName, numberOfHalfSteps)
            .slice(0, 2);
        const semitoneIndex = this._t.getModalIndex(genericName);
        const octave = this._octave + deltaOctave;
        return this._t.getFreqByModalIndexAndOctave(semitoneIndex, octave);
    }

    /**
     * Calculate the frequency of the note numberOfScalarSteps
        away from the current note.
     * @param numberOfScalarSteps - The interval in scalar steps
     * @returns - The frequency of the note at the specified interval.
     */
    getScalarInterval(numberOfScalarSteps: number): number {
        const [genericName, deltaOctave] = this._ks
            .scalarTransform(this._genericName, numberOfScalarSteps)
            .slice(0, 2);
        const semitoneIndex = this._t.getModalIndex(genericName as string);
        const octave = this._octave + (deltaOctave as number);
        return this._t.getFreqByModalIndexAndOctave(semitoneIndex, octave);
    }

    /**
     * @returns - The frequency of the current note in Hertz
     */
    get freq(): number {
        return this._freq;
    }

    /**
     * @returns - The octave of the current note
     */
    get octave(): number {
        return this._octave;
    }

    /**
     * @returns - The generic name of the current note
     */
    get genericName(): string {
        return this._genericName;
    }

    /**
     * @returns - The modal index of the current note
     */
    get semitoneIndex(): number {
        return this._semitoneIndex;
    }

    /**
     * @returns - The index of the current note within the list of all of the
            notes defined by the temperament
     */
    get number(): number {
        return this._number;
    }
}
