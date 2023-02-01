/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Kumar Saurabh Raj. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { ITemperament, PitchTuple } from '../@types/temperament';
import { normalizePitch, CHROMATIC_NOTES_SHARP, CHROMATIC_NOTES_FLAT } from './musicUtils';
import { ItemNotFoundDefaultError } from './errors';

/**
 * Temperament defines the relationships between notes.
 *
 * @remarks
 * In musical tuning, temperament is a tuning system that defines the notes (semitones) in an
 * octave. Most modern Western musical instruments are tuned in the equal temperament system based
 * on the 1/12 root of 2 (12 semitones per octave). Many traditional temperaments are based on
 * ratios.
 */
export default class Temperament implements ITemperament {
    /**
     * The intervals define which ratios are used to define the notes within a given temperament.
     */
    private static readonly DEFAULT_INTERVALS: string[] = [
        'perfect 1',
        'minor 2',
        'major 2',
        'minor 3',
        'major 3',
        'perfect 4',
        'diminished 5',
        'perfect 5',
        'minor 6',
        'major 6',
        'minor 7',
        'major 7',
        'perfect 8',
    ];

    private static readonly TWELVE_TONE_EQUAL_RATIOS: { [key: string]: number } = {
        'perfect 1': 1,
        'minor 2': Math.pow(2, 1 / 12),
        'augmented 1': Math.pow(2, 1 / 12),
        'major 2': Math.pow(2, 2 / 12),
        'augmented 2': Math.pow(2, 3 / 12),
        'minor 3': Math.pow(2, 3 / 12),
        'major 3': Math.pow(2, 4 / 12),
        'augmented 3': Math.pow(2, 5 / 12),
        'diminished 4': Math.pow(2, 4 / 12),
        'perfect 4': Math.pow(2, 5 / 12),
        'augmented 4': Math.pow(2, 6 / 12),
        'diminished 5': Math.pow(2, 6 / 12),
        'perfect 5': Math.pow(2, 7 / 12),
        'augmented 5': Math.pow(2, 8 / 12),
        'minor 6': Math.pow(2, 8 / 12),
        'major 6': Math.pow(2, 9 / 12),
        'augmented 6': Math.pow(2, 10 / 12),
        'minor 7': Math.pow(2, 10 / 12),
        'major 7': Math.pow(2, 11 / 12),
        'augmented 7': Math.pow(2, 12 / 12),
        'diminished 8': Math.pow(2, 11 / 12),
        'perfect 8': 2,
    };

    private static readonly JUST_INTONATION_RATIOS: { [key: string]: number } = {
        'perfect 1': 1,
        'minor 2': 16 / 15,
        'augmented 1': 16 / 15,
        'major 2': 9 / 8,
        'augmented 2': 6 / 5,
        'minor 3': 6 / 5,
        'major 3': 5 / 4,
        'augmented 3': 4 / 3,
        'diminished 4': 5 / 4,
        'perfect 4': 4 / 3,
        'augmented 4': 7 / 5,
        'diminished 5': 7 / 5,
        'perfect 5': 3 / 2,
        'augmented 5': 8 / 5,
        'minor 6': 8 / 5,
        'major 6': 5 / 3,
        'augmented 6': 16 / 9,
        'minor 7': 16 / 9,
        'major 7': 15 / 8,
        'augmented 7': 2 / 1,
        'diminished 8': 15 / 8,
        'perfect 8': 2,
    };

    private static readonly PYTHAGOREAN_RATIOS: { [key: string]: number } = {
        'perfect 1': 1,
        'minor 2': 256 / 243,
        'augmented 1': 256 / 243,
        'major 2': 9 / 8,
        'augmented 2': 32 / 27,
        'minor 3': 32 / 27,
        'major 3': 81 / 64,
        'augmented 3': 4 / 3,
        'diminished 4': 81 / 64,
        'perfect 4': 4 / 3,
        'augmented 4': 729 / 512,
        'diminished 5': 729 / 512,
        'perfect 5': 3 / 2,
        'augmented 5': 128 / 81,
        'minor 6': 128 / 81,
        'major 6': 27 / 16,
        'augmented 6': 16 / 9,
        'minor 7': 16 / 9,
        'major 7': 243 / 128,
        'augmented 7': 2 / 1,
        'diminished 8': 243 / 128,
        'perfect 8': 2,
    };

    private static readonly THIRD_COMMA_MEANTONE_RATIOS: { [key: string]: number } = {
        'perfect 1': 1,
        'minor 2': 1.075693,
        'augmented 1': 1.037156,
        'major 2': 1.115656,
        'augmented 2': 1.157109,
        'minor 3': 1.200103,
        'major 3': 1.244694,
        'augmented 3': 1.290943,
        'diminished 4': 1.290943,
        'perfect 4': 1.338902,
        'augmented 4': 1.38865,
        'diminished 5': 1.440247,
        'perfect 5': 1.493762,
        'augmented 5': 1.549255,
        'minor 6': 1.60682,
        'major 6': 1.666524,
        'augmented 6': 1.728445,
        'minor 7': 1.792668,
        'major 7': 1.859266,
        'augmented 7': 1.92835,
        'diminished 8': 1.92835,
        'perfect 8': 2,
    };

    private static readonly THIRD_COMMA_MEANTONE_INTERVALS: string[] = [
        'perfect 1',
        'augmented 1',
        'minor 2',
        'major 2',
        'augmented 2',
        'minor 3',
        'major 3',
        'diminished 4',
        'perfect 4',
        'augmented 4',
        'diminished 5',
        'perfect 5',
        'augmented 5',
        'minor 6',
        'major 6',
        'augmented 6',
        'minor 7',
        'major 7',
        'diminished 8',
        'perfect 8',
    ];

    private static readonly QUARTER_COMMA_MEANTONE_RATIOS: { [key: string]: number } = {
        'perfect 1': 1,
        'minor 2': 16 / 15,
        'augmented 1': 25 / 24,
        'major 2': 9 / 8,
        'augmented 2': 75 / 64,
        'minor 3': 6 / 5,
        'major 3': 5 / 4,
        'diminished 4': 32 / 25,
        'augmented 3': 125 / 96,
        'perfect 4': 4 / 3,
        'augmented 4': 25 / 18,
        'diminished 5': 36 / 25,
        'perfect 5': 3 / 2,
        'augmented 5': 25 / 16,
        'minor 6': 8 / 5,
        'major 6': 5 / 3,
        'augmented 6': 125 / 72,
        'minor 7': 9 / 5,
        'major 7': 15 / 8,
        'diminished 8': 48 / 25,
        'augmented 7': 125 / 64,
        'perfect 8': 2,
    };

    private static readonly QUARTER_COMMA_MEANTONE_INTERVALS: string[] = [
        'perfect 1',
        'augmented 1',
        'minor 2',
        'major 2',
        'augmented 2',
        'minor 3',
        'major 3',
        'diminished 4',
        'augmented 3',
        'perfect 4',
        'augmented 4',
        'diminished 5',
        'perfect 5',
        'augmented 5',
        'minor 6',
        'major 6',
        'augmented 6',
        'minor 7',
        'major 7',
        'diminished 8',
        'augmented 7',
        'perfect 8',
    ];

    /**
     * Base frequency in Hertz.
     * @remarks By default, we use C in Octave 0 as our base frequency.
     */
    public static readonly C0: number = 16.3516;

    /** The name of the temperament. */
    private _name: string;
    /**
     * List of all of the frequencies in the temperament.
     * @remarks Each temperament contains a list of notes in hertz.
     */
    private _freqs: number[] = [];
    /** Number of semitones in octave. */
    private _octaveLength: number;
    /** The frequency (in Hertz) used to seed the calculation of the notes. */
    private _baseFrequency: number;
    /** The number of octaves in the temperament. */
    private _numberOfOctaves: number;
    /** Temperament interval names. */
    private _intervals: string[];
    /** Ratios associated with the current interval set. */
    private _ratios: { [key: string]: number };
    /** An array of names for each note in an octave. */
    private _genericNoteNames: string[] = [];

    /**
     * Initializes the class.
     *
     * @remarks
     * A temperament will be generated but it can subsequently be overriden.
     *
     * @param name - The name of a temperament, e.g., "equal", "just intonation". etc.
     */
    constructor(name = 'equal') {
        this._name = name;
        this._octaveLength = 12;
        this._baseFrequency = Temperament.C0;
        this._numberOfOctaves = 8;
        this._ratios = {};
        this._intervals = [];
        this.generate(this._name);
    }

    /**
     * @remarks
     * The base frequency is used as the starting point for generating the notes.
     *
     * @param frequency - The frequency (in Hertz) used to seed the calculation of the notes used in
     * the temperament.
     */
    public set baseFrequency(frequency: number) {
        this._baseFrequency = frequency;
    }

    /**
     * The base frequency (in Hertz) used to seed the calculations.
     */
    public get baseFrequency(): number {
        return this._baseFrequency;
    }

    /**
     * @remarks
     * How many octaves are defined for the temperament?
     *
     * @param num - The number of octaves in the temperament. (8 octaves in equal temperament would
     * span 96 notes).
     */
    public set numberOfOctaves(num: number) {
        this._numberOfOctaves = Math.min(1, Number(Math.abs(num)));
    }

    /**
     * The number of octaves in the temperament.
     */
    public get numberOfOctaves(): number {
        return this._numberOfOctaves;
    }

    /**
     * The name of the temperament.
     */
    public get name(): string {
        return this._name;
    }

    /**
     * List of all of the frequencies in the temperament.
     */
    public get freqs(): number[] {
        return this._freqs;
    }

    /**
     * Finds the index of the frequency nearest to the target.
     *
     * @param target - The target frequency we are looking for.
     * @returns The index into the freqs array for the entry nearest to the target.
     */
    public getNearestFreqIndex(target: number): number {
        let min = 10000;
        let minIndex = 0;
        for (const [i, f] of this._freqs.entries()) {
            if (Math.abs(f - target) < min) {
                // If we are getting closer, store the index.
                min = Math.abs(f - target);
                // An exact match: no need to keep looking.
                if (min == 0) {
                    return i;
                }
                minIndex = i;
            } else {
                // We've passed the minimum, so return the previous index.
                return minIndex;
            }
        }
        return minIndex;
    }

    /**
     * The list of generic note names.
     *
     * @remarks
     * Generic note names are assigned to define a chromatic scale.
     */
    public get noteNames(): string[] {
        return this._genericNoteNames;
    }

    /**
     * Returns the generic note name associated with an index.
     *
     * @param semitoneIndex - Index into generic note names that define an octave.
     * @returns The corresponding note name.
     */
    public getNoteName(semitoneIndex: number): string {
        return this._genericNoteNames[semitoneIndex];
    }

    /**
     * Returns the index associated with a generic note name.
     *
     * @param noteName - The corresponding note name.
     * @returns Index into generic note names that define an octave.
     */
    public getModalIndex(noteName: string): number {
        return this._genericNoteNames.indexOf(noteName);
    }

    /**
     * Returns the frequency by an index into the frequency list.
     *
     * @param pitchIndex - The index into the frequency list.
     * @returns The frequency (in Hertz) of a note by index.
     */
    public getFreqByIndex(pitchIndex: number): number {
        if (this._freqs.length === 0) {
            return 0;
        }

        pitchIndex = Math.max(0, Math.min(this._freqs.length - 1, pitchIndex));
        return this._freqs[Math.floor(pitchIndex)];
    }

    /**
     * Converts an index into the frequency list into a modal index and an octave.
     *
     * @param pitchIndex - The index into the frequency list.
     * @returns An array (2-tuple) of the modal index in the scale and the octave.
     */
    public getModalIndexAndOctaveFromFreqIndex(pitchIndex: number): [number, number] {
        return [pitchIndex % this._octaveLength, Math.floor(pitchIndex / this._octaveLength)];
    }

    /**
     * Returns the frequency that corresponds to the index and octave (in Hertz).
     *
     * @remarks
     * Modal index is an index into the notes in a octave.
     *
     * @param modalIndex - The index of the note within an octave.
     * @param octave - Which octave to access.
     */
    public getFreqByModalIndexAndOctave(modalIndex: number, octave: number): number {
        if (this._freqs.length === 0) {
            return 0;
        }

        const i: number = Math.floor(octave) * this._octaveLength + modalIndex;
        return this._freqs[Math.max(0, Math.min(i, this._freqs.length - 1))];
    }

    /**
     * @remarks
     * Note name can be used to calculate an index the notes in an octave.
     *
     * @param idx - The index into the frequency list.
     * @returns An array (2-tuple) of the name of the note and which octave to access.
     */
    public getGenericNoteNameAndOctaveByFreqIndex(idx: number): [string, number] {
        return [
            this._genericNoteNames[idx % this._octaveLength],
            Math.floor(idx / this._octaveLength),
        ];
    }

    /**
     * @remarks
     * Note name can be used to calculate an index the notes in an octave.
     *
     * @param noteName - The name of the note.
     * @param octave - Which octave to access.
     * @returns The index into the frequency list.
     *
     * @throws {ItemNotFoundDefaultError}
     * Thrown if note name does not exist in list of generic note names.
     */
    public getFreqIndexByGenericNoteNameAndOctave(noteName: string, octave: number): number {
        if (!this._genericNoteNames.includes(noteName)) {
            throw new ItemNotFoundDefaultError<number>(
                `Note '${noteName}' not found in generic note names.`,
                0,
            );
        }

        const ni: number = this._genericNoteNames.indexOf(noteName);
        const i: number = octave * this._octaveLength + ni;
        if (i < 0) {
            return 0;
        }
        if (i > this._freqs.length - 1) {
            return this._freqs.length - 1;
        }
        return Math.floor(i);
    }

    /**
     * @remarks
     * Note name can be used to calculate an index the notes in an octave.
     *
     * @param noteName - The name of the note.
     * @param octave - Which octave to access.
     * @returns The frequency that corresponds to the index and octave (in Hertz).
     */
    public getFreqByGenericNoteNameAndOctave(noteName: string, octave: number): number {
        try {
            if (this._freqs.length === 0) {
                return 0;
            }
            return this._freqs[this.getFreqIndexByGenericNoteNameAndOctave(noteName, octave)];
        } catch (err) {
            return this._freqs[(err as ItemNotFoundDefaultError<number>).defaultValue];
        }
    }

    /**
     * The number of notes defined per octave.
     */
    public get numberOfSemitonesInOctave(): number {
        return this._octaveLength;
    }

    /**
     * The number of notes defined by the temperament.
     */
    public get numberOfNotesInTemperament(): number {
        return this._freqs.length;
    }

    /**
     * Defines a generic name for each note in the octave.
     *
     * @remarks
     * The convention is n0, n1, etc. These notes can be used by the
     * `getFreqByGenericNoteNameAndOctave` method to retrieve a frequency by note name and octave.
     */
    private _generateGenericNoteNames() {
        this._genericNoteNames = [];
        for (let i = 0; i < this._octaveLength; i++) {
            this._genericNoteNames.push(`n${i}`);
        }
    }

    /**
     * Creates one of the predefined temperaments based on the rules for generating the frequencies
     * and the selected intervals used to determine which frequencies to include in the temperament.
     * A rule might be to use a series of ratios between steps, as in the Pythagorean temperament,
     * or to use a fixed ratio, such as the twelth root of two when calculating equal temperament.
     *
     * - The base frequency used when applying the rules is defined in `this._baseFrequency`.
     * - The number of times to apply the rules is determined by `this._numberOfOctaves`.
     * - The resultant frequencies are stored in `this._freqs`.
     * - The resultant number of notes per octave is stored in `this._octaveLength`.
     *
     * @param name - The name of one of the predefined temperaments.
     */
    public generate(name: string): void {
        this._name = name.toLowerCase();

        let ratios: { [key: string]: number }, intervals: string[];
        if (this._name == 'third comma meantone') {
            intervals = [...Temperament.THIRD_COMMA_MEANTONE_INTERVALS];
            ratios = Temperament.THIRD_COMMA_MEANTONE_RATIOS;
        } else if (this._name == 'quarter comma meantone') {
            intervals = [...Temperament.QUARTER_COMMA_MEANTONE_INTERVALS];
            ratios = Temperament.QUARTER_COMMA_MEANTONE_RATIOS;
        } else {
            intervals = [...Temperament.DEFAULT_INTERVALS];
            if (this._name == 'equal') {
                ratios = Temperament.TWELVE_TONE_EQUAL_RATIOS;
            } else if (this._name == 'just intonation') {
                ratios = Temperament.JUST_INTONATION_RATIOS;
            } else if (this._name == 'pythagorean') {
                ratios = Temperament.PYTHAGOREAN_RATIOS;
            } else {
                // Defaulting to 12-tone equal temperament.
                console.debug(`Unknown temperament ${name}; using equal temperament`);
                ratios = Temperament.TWELVE_TONE_EQUAL_RATIOS;
            }
        }

        this._ratios = ratios;
        this._intervals = intervals;
        this._octaveLength = intervals.length - 1;
        this._freqs = [this._baseFrequency];

        for (let octave = 0; octave < this.numberOfOctaves; octave++) {
            const c = this._freqs[this._freqs.length - 1];
            for (let i = 0; i < this._octaveLength; i++) {
                if (i === 0) {
                    continue;
                }
                this._freqs.push(c * ratios[intervals[i]]);
            }
        }

        this._generateGenericNoteNames();
    }

    /**
     * @remarks
     * Equal temperaments can be generated for different numbers of steps between the notes in an
     * octave. The predefined equal temperament defines 12 steps per octave, which is perhaps the
     * most common tuning system in modern Western music. But any number of steps can be used.
     *
     * @param numberOfSteps - The number of equal steps into which to divide an octave.
     */
    public generateEqualTemperament(numberOfSteps: number): void {
        let nsteps: number = Math.floor(numberOfSteps);
        if (nsteps < 1) {
            nsteps = 1;
        }
        this._name = `equal_${nsteps}`;  // By convention, start the name with 'equal'.
        this._octaveLength = nsteps;
        this._freqs = [this._baseFrequency];

        // nth root of 2
        const root = Math.pow(2, 1 / nsteps);
        for (let octave = 0; octave < this.numberOfOctaves; octave++) {
            for (let i = 0; i < this._octaveLength; i++) {
                if (i == 0) {
                    continue;
                }
                this._freqs.push(this._freqs[this._freqs.length - 1] * root);
            }
        }

        this._generateGenericNoteNames();
    }

    /**
     * @remarks
     * A custom temperament can be defined with arbitrary rules.
     *
     * @param intervals - An ordered list of interval names to define per octave.
     * @param ratios - A dictionary of ratios to apply when generating the note frequencies in an
       octave. The dictionary keys are defined in the intervals list. Each ratio (between 1 and 2)
       is applied to the base frequency of the octave. The final frequency should always be equal to
       2.
     * @param name - The name associated with the custom temperament.
     */
    public generateCustom(
        intervals: string[],
        ratios: { [key: string]: number },
        name = 'custom',
    ): void {
        this._name = name;
        this._octaveLength = intervals.length;
        this._freqs = [this._baseFrequency];

        for (let octave = 0; octave < this.numberOfOctaves; octave++) {
            const c = this._freqs[this._freqs.length - 1];
            for (let i = 0; i < this._octaveLength; i++) {
                if (i === 0) {
                    continue;
                }
                this._freqs.push(c * ratios[intervals[i]]);
            }
        }

        this._generateGenericNoteNames();
    }

    /**
     * Calculates a base frequency based on a pitch and frequency.
     *
     * @param pitchName - Pitch name, e.g. A#.
     * @param octave - Octave.
     * @param frequency - Frequency from which to calculate the new base frequency.
     * @returns New base frequency for C0.
     *
     * @throws {ItemNotFoundError}
     * Thrown if normalized pitch name does not exist in list of chromatic sharp/flat notes.
     */
    public tune(pitchName: string, octave: number, frequency: number): number {
        pitchName = normalizePitch(pitchName);

        let i: number;
        if (CHROMATIC_NOTES_SHARP.includes(pitchName)) {
            i = CHROMATIC_NOTES_SHARP.indexOf(pitchName);
        } else if (CHROMATIC_NOTES_FLAT.includes(pitchName)) {
            i = CHROMATIC_NOTES_FLAT.indexOf(pitchName);
        } else {
            throw new ItemNotFoundDefaultError<number>(`Pitch '${pitchName}' not found.`, 0);
        }

        if (Object.keys(this._ratios).length && this._intervals.length !== 0) {
            this._baseFrequency = frequency / 2 ** octave / this._ratios[this._intervals[i]];
            this.generate(this._name);
        }
        return this._baseFrequency;
    }

    /**
     * Returns the instance's list of frequencies as a string.
     * @override
     */
    public toString(): string {
        const freqs: string[] = [];
        for (const f of this.freqs) {
            freqs.push((f + 0.005).toFixed(2));
        }
        return `this.name temperament:\n\n${freqs.join('\n')}\n`;
    }

    /**
     * If we are using an equal temperament, we can calculate cents.
     *
     * @param frequency - in hertz
     * @returns PitchTuple [generic note name, octave, cents]
     *
     * @throws {InvalidArgumentError}
     * Thrown if the temperament is not an equal temperament.
     */
    public frequencyToPitchOctaveCents(frequency: number): PitchTuple {
        // Calculate the pitch and octave based on frequency, rounding to
        // the nearest cent.
        if (frequency < this._baseFrequency) {
            return ["n0", 0, 0];
        }

        // Find the nearest note.
        let pitchIndex: number = this.getNearestFreqIndex(frequency);
        const thisFreq: number = this.getFreqByIndex(pitchIndex);
        if (thisFreq > frequency * 1.0003) {  // We must have rounded up.
            pitchIndex -= 1;
        }

        // nth root of 2
        const root: number = Math.pow(2, 1 / (this._octaveLength * 100));

        for (let cents = 0; cents < 100; cents++) {
            const f: number = this._baseFrequency * Math.pow(root, (pitchIndex * 100) + cents);
            if (frequency < f * 1.0003 && frequency > f * 0.9997) {
                const obj: [string, number] = this.getGenericNoteNameAndOctaveByFreqIndex(
                    pitchIndex
                );
                return [obj[0], obj[1], cents];
            }
        }
        // no match???
        throw new ItemNotFoundDefaultError("No matching note found in temperament", 0);
    }
}
