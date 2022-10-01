/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { IScale } from '../@types/scale';
import { InvalidArgumentError } from './errors';

/**
 * A scale is a selection of notes in an octave.
 */
export class Scale implements IScale {
    static readonly TWELVE2TWENTYONE = {
        n0: ['n0', 'n0'], // c
        n1: ['n1', 'n2'], // c#, db
        n2: ['n3', 'n3'], // d
        n3: ['n4', 'n5'], // d# eb
        n4: ['n6', 'n6'], // e
        n5: ['n9', 'n9'], // f
        n6: ['n10', 'n11'], // f#, gb
        n7: ['n12', 'n12'], // g
        n8: ['n13', 'n14'], // g#, ab
        n9: ['n15', 'n15'], // a
        n10: ['n16', 'n17'], // a#, bb
        n11: ['n18', 'n18'], // b
    } as {
        [key: string]: [string, string];
    };

    /** Number of semitones in the scale. */
    private _numberOfSemitones: number;
    /** Array of generic note names. */
    private _noteNames: string[];
    /** Array of note names in the scale. */
    private _scale: string[];
    /** Array of octave deltas corresponding to notes. */
    private _octaveDeltas: number[];

    /**
     * @remarks
     * When defining a scale, we need the half steps pattern that defines the selection and a
     * starting note, e.g., C or F#.
     *
     * @param halfStepsPattern - A list of integer values that define how many half steps to take
     * between each note in the scale, e.g., [2, 2, 1, 2, 2, 2, 1] defines the steps for a Major
     * scale.
     * @param startingIndex - An index into the half steps defining an octave that determines from
     * where to start building the scale, e.g., 0 for C and 7 for G in a 12-step temperament.
     * Defaults to `0`.
     * @param numberOfSemitones - If the `halfStepsPattern` is an empty list, then use the number
     * of semitones instead. (Or trigger a mapping from 12 to 21.) Defaults to `12`.
     * @param preferSharps - If we are mapping from 12 to 21 semitones, we need to know whether or
     * not to prefer sharps or flats. Defaults to `true`.
     */
    constructor(
        halfStepsPattern: number[] | null = null,
        startingIndex = 0,
        numberOfSemitones = 12,
        preferSharps = true,
    ) {
        // Calculate the number of semitones by summing up the half steps.
        if (halfStepsPattern === null) {
            this._numberOfSemitones = numberOfSemitones;
            halfStepsPattern = [];
            for (let i = 0; i < this._numberOfSemitones; i++) {
                halfStepsPattern.push(1);
            }
        } else {
            this._numberOfSemitones = 0;
            for (const step of halfStepsPattern) {
                this._numberOfSemitones += step;
            }
        }

        // Define generic note names that map to temperament.
        this._noteNames = [];
        for (let i = 0; i < this._numberOfSemitones; i++) {
            this._noteNames.push(`n${i}`);
        }

        let i = startingIndex % this._noteNames.length;
        let octave = 0;
        this._scale = [this._noteNames[i]];
        this._octaveDeltas = [octave];
        for (const step of halfStepsPattern) {
            i += step;
            if (i >= this._numberOfSemitones) {
                octave++;
                i -= this._numberOfSemitones;
            }
            this._scale.push(this._noteNames[i]);
            this._octaveDeltas.push(octave);
        }

        /*
         * We defined the number of semitones based on the half steps pattern but we may want to map
         * from a 12 step scale to anotther scale, e.g. 21 step scale.
         */
        if (this._numberOfSemitones !== numberOfSemitones && numberOfSemitones == 21) {
            const j = preferSharps ? 0 : 1;
            for (const [i, note] of this._scale.entries()) {
                this._scale[i] = Scale.TWELVE2TWENTYONE[note][j];
            }

            // And regenerate the semitone scale.
            this._numberOfSemitones = numberOfSemitones;
            this._noteNames = [];
            for (let i = 0; i < this._numberOfSemitones; i++) {
                this._noteNames.push(`n${i}`);
            }
        }
    }

    /**
     * Returns the number of notes in the scale.
     *
     * @remarks
     * The number of semitones is the number of notes in the temperament.
     *
     * @returns The length of the `_noteNames` array.
     *
     * @readonly
     */
    public get numberOfSemitones(): number {
        return this._noteNames.length;
    }

    /**
     * Returns the notes defined by the temperament.
     *
     * @remarks
     * The notes defined by the temperament are used to build the scale.
     *
     * @readonly
     */
    public get noteNames(): string[] {
        return this._noteNames;
    }

    /**
     * Returns the notes in the scale.
     *
     * @param pitchFormat - Array of letter names in the teperament.
     *
     * @throws {InvalidArgumentError}
     * Thrown if `pitchFormat` length does not match number of semitones.
     */
    public getScale(pitchFormat?: string[]): string[] {
        if (pitchFormat === undefined) {
            return this._scale;
        }

        if (pitchFormat.length === this._numberOfSemitones) {
            const scale: string[] = [];
            for (let i = 0; i < this._scale.length; i++) {
                scale.push(pitchFormat[this._noteNames.indexOf(this._scale[i])]);
            }
            return scale;
        }

        throw new InvalidArgumentError('pitch format does not match number of semitones');
    }

    /**
     * Returns the notes in the scale and the octave deltas.
     *
     * @remarks
     * The notes in the scale are a subset of the notes defined by the temperament.
     * The octave deltas (either 0 or 1) are used to mark notes above B#, which would be in the next
     * octave, e.g., G3, A3, B3, C4...
     *
     * @param pitchFormat - Array of letter names in the teperament.
     * @returns an array (2-tuple) of the notes in the scale and the octave deltas.
     *
     * @throws {InvalidArgumentError}
     * Thrown if `pitchFormat` length does not match number of semitones.
     */
    public getScaleAndOctaveDeltas(pitchFormat?: string[]): [string[], number[]] {
        return [this.getScale(pitchFormat), this._octaveDeltas];
    }

    /**
     * Returns the octave delta for a note in the scale.
     *
     * @remarks
     * The notes in the scale are a subset of the notes defined by the temperament.
     * The octave deltas (either 0 or 1) are used to mark notes above B#, which would be in the next
     * octave, e.g., G3, A3, B3, C4...
     *
     * @param noteIndex - index of note in the scale
     * @returns the octave delta of the indexed note.
     *
     * @throws {InvalidArgumentError}
     * Thrown if `noteIndex` is not in the range of modeLength.
     */
    public getOctaveDelta(noteIndex: number): number {
        if (noteIndex < 0 || noteIndex > this._noteNames.length - 1) {
            throw new InvalidArgumentError(
                'noteIndex must be in range of scale length.',
            );
        }
        return this._octaveDeltas[noteIndex];
    }
}
