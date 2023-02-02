/*
 * Copyright (c) 2021, Walter Bender. All rights reserved.
 * Copyright (c) 2021, Anindya Kundu. All rights reserved.
 *
 * Licensed under the AGPL-3.0 License.
 */

import { ItemNotFoundError } from './errors';
import { InvalidArgumentError } from './errors';

/*
 * Utilities and constants retated to musical state as required by other related modules.
 */

const SHARP = '♯';
const FLAT = '♭';
const NATURAL = '♮';
const DOUBLESHARP = '𝄪';
const DOUBLEFLAT = '𝄫';

export const CHROMATIC_NOTES_SHARP: string[] = [
    'c',
    'c#',
    'd',
    'd#',
    'e',
    'f',
    'f#',
    'g',
    'g#',
    'a',
    'a#',
    'b',
];

export const CHROMATIC_NOTES_FLAT: string[] = [
    'c',
    'db',
    'd',
    'eb',
    'e',
    'f',
    'gb',
    'g',
    'ab',
    'a',
    'bb',
    'b',
];

/**
 * @remarks
 * Meantone temperaments use 21 notes.
 */
export const ALL_NOTES: string[] = [
    'c',
    'c#',
    'db',
    'd',
    'd#',
    'eb',
    'e',
    'e#',
    'fb',
    'f',
    'f#',
    'gb',
    'g',
    'g#',
    'ab',
    'a',
    'a#',
    'bb',
    'b',
    'b#',
    'cb',
];

export const SCALAR_MODE_NUMBERS: string[] = ['1', '2', '3', '4', '5', '6', '7'];

export const SOLFEGE_NAMES: string[] = ['do', 're', 'me', 'fa', 'sol', 'la', 'ti'];

export const EAST_INDIAN_NAMES: string[] = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];

export const EQUIVALENT_FLATS: { [key: string]: string } = {
    'c#': 'db',
    'd#': 'eb',
    'f#': 'gb',
    'g#': 'ab',
    'a#': 'bb',
    'e#': 'f',
    'b#': 'c',
    'cb': 'cb',
    'fb': 'fb',
};

export const EQUIVALENT_SHARPS: { [key: string]: string } = {
    'db': 'c#',
    'eb': 'd#',
    'gb': 'f#',
    'ab': 'g#',
    'bb': 'a#',
    'cb': 'b',
    'fb': 'e',
    'e#': 'e#',
    'b#': 'b#',
};

/**
 * @remarks
 * This notation only applies to temperaments with 12 semitones.
 */
export const PITCH_LETTERS: string[] = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

/**
 * @remarks
 * These defintions are only relevant to equal temperament.
 */
export const SOLFEGE_SHARP: string[] = [
    'do',
    'do#',
    're',
    're#',
    'me',
    'fa',
    'fa#',
    'sol',
    'sol#',
    'la',
    'la#',
    'ti',
];

export const SOLFEGE_FLAT: string[] = [
    'do',
    'reb',
    're',
    'meb',
    'me',
    'fa',
    'solb',
    'sol',
    'lab',
    'la',
    'tib',
    'ti',
];

export const EAST_INDIAN_SHARP: string[] = [
    'sa',
    'sa#',
    're',
    're#',
    'ga',
    'ma',
    'ma#',
    'pa',
    'pa#',
    'dha',
    'dha#',
    'ni',
];

export const EAST_INDIAN_FLAT: string[] = [
    'sa',
    'reb',
    're',
    'gab',
    'ga',
    'ma',
    'pab',
    'pa',
    'dhab',
    'dha',
    'nib',
    'ni',
];

export const SCALAR_NAMES_SHARP: string[] = [
    '1',
    '1#',
    '2',
    '2#',
    '3',
    '4',
    '4#',
    '5',
    '5#',
    '6',
    '6#',
    '7',
];

export const SCALAR_NAMES_FLAT: string[] = [
    '1',
    '2b',
    '2',
    '3b',
    '3',
    '4',
    '4b',
    '5',
    '6b',
    '6',
    '7b',
    '7',
];

export const EQUIVALENTS: { [key: string]: string[] } = {
    'ax': ['b', 'cb'],
    'a#': ['bb'],
    'a': ['a', 'bbb', 'gx'],
    'ab': ['g#'],
    'abb': ['g', 'fx'],
    'bx': ['c#'],
    'b#': ['c', 'dbb'],
    'b': ['b', 'cb', 'ax'],
    'bb': ['a#'],
    'bbb': ['a', 'gx'],
    'cx': ['d'],
    'c#': ['db'],
    'c': ['c', 'dbb', 'b#'],
    'cb': ['b'],
    'cbb': ['bb', 'a#'],
    'dx': ['e', 'fb'],
    'd#': ['eb', 'fbb'],
    'd': ['d', 'ebb', 'cx'],
    'db': ['c#', 'bx'],
    'dbb': ['c', 'b#'],
    'ex': ['f#', 'gb'],
    'e#': ['f', 'gbb'],
    'e': ['e', 'fb', 'dx'],
    'eb': ['d#', 'fbb'],
    'ebb': ['d', 'cx'],
    'fx': ['g', 'abb'],
    'f#': ['gb', 'ex'],
    'f': ['f', 'e#', 'gbb'],
    'fb': ['e', 'dx'],
    'fbb': ['eb', 'd#'],
    'gx': ['a', 'bbb'],
    'g#': ['ab'],
    'g': ['g', 'abb', 'fx'],
    'gb': ['f#', 'ex'],
    'gbb': ['f', 'e#'],
};

export const CONVERT_DOWN: { [key: string]: string } = {
    c: 'b#',
    cb: 'b',
    cbb: 'a#',
    d: 'cx',
    db: 'c#',
    dbb: 'c',
    e: 'dx',
    eb: 'd#',
    ebb: 'd',
    f: 'e#',
    fb: 'e',
    fbb: 'd#',
    g: 'fx',
    gb: 'f#',
    gbb: 'f',
    a: 'gx',
    ab: 'g#',
    abb: 'g',
    b: 'ax',
    bb: 'a#',
    bbb: 'a',
};

export const CONVERT_UP: { [key: string]: string } = {
    'cx': 'd',
    'c#': 'db',
    'c': 'dbb',
    'dx': 'e',
    'd#': 'eb',
    'd': 'ebb',
    'ex': 'f#',
    'e#': 'f',
    'e': 'fb',
    'fx': 'g',
    'f#': 'gb',
    'f': 'gbb',
    'gx': 'a',
    'g#': 'ab',
    'g': 'abb',
    'ax': 'b',
    'a#': 'bb',
    'a': 'bbb',
    'bx': 'c#',
    'b#': 'c',
    'b': 'cb',
};

// Pitch name types

export const GENERIC_NOTE_NAME = 'generic note name';
export const LETTER_NAME = 'letter name';
export const SOLFEGE_NAME = 'solfege name';
export const EAST_INDIAN_SOLFEGE_NAME = 'east indian solfege name';
export const SCALAR_MODE_NUMBER = 'scalar mode number';
export const CUSTOM_NAME = 'custom name';
export const UNKNOWN_PITCH_NAME = 'unknown';

/**
 * Removes an accidental and return the number of half steps that would have resulted from its
 * application to the pitch.
 *
 * @param pitch - Upper or lowecase pitch name with accidentals as ASCII or Unicode.
 * @returns An array (2-tuple) of the normalized pitch name and the change in half steps represented
 * by the removed accidental.
 */
export function stripAccidental(pitch: string): [string, number] {
    if (pitch.length === 1) {
        return [pitch, 0];
    }

    // The ASCII versions.
    if (pitch.length > 2 && pitch.endsWith('bb')) {
        return [pitch.slice(0, pitch.length - 2), -2];
    }
    if (pitch.endsWith('b')) {
        return [pitch.slice(0, pitch.length - 1), -1];
    }
    if (pitch.endsWith('#')) {
        return [pitch.slice(0, pitch.length - 1), 1];
    }
    if (pitch.endsWith('x')) {
        return [pitch.slice(0, pitch.length - 1), 2];
    }

    // And the Unicode versions...
    if (pitch.endsWith(DOUBLEFLAT)) {
        return [pitch.slice(0, pitch.length - 2), -2];
    }
    if (pitch.endsWith(FLAT)) {
        return [pitch.slice(0, pitch.length - 1), -1];
    }
    if (pitch.endsWith(SHARP)) {
        return [pitch.slice(0, pitch.length - 1), 1];
    }
    if (pitch.endsWith(DOUBLESHARP)) {
        return [pitch.slice(0, pitch.length - 2), 2];
    }
    if (pitch.endsWith(NATURAL)) {
        return [pitch.slice(0, pitch.length - 1), 0];
    }

    // No accidentals were present.
    return [pitch, 0];
}

/**
 * Returns the normalized pitch nane.
 *
 * @remarks
 * Internally, we use a standardize form for our pitch letter names:
 * - Lowercase c, d, e, f, g, a, b for letter names.
 * - #, b, x, and bb for sharp, flat, double sharp, and double flat for accidentals.
 *
 * Note names for temperaments with more than 12 semitones are of the form: n0, n1, ...
 *
 * @param pitch - Upper or lowecase pitch name with accidentals as ASCII or Unicode.
 * @returns The normalized pitch name.
 */
export function normalizePitch(pitch: string): string {
    if (typeof pitch === 'number') {
        return pitch;
    }

    pitch = pitch.toLowerCase();
    pitch = pitch.replace(SHARP, '#');
    pitch = pitch.replace(DOUBLESHARP, 'x');
    pitch = pitch.replace(FLAT, 'b');
    pitch = pitch.replace(DOUBLEFLAT, 'bb');
    pitch = pitch.replace(NATURAL, '');
    return pitch;
}

/**
 * Returns a pretty pitch name.
 *
 * @remarks
 * The internal pitch name is converted to unicode, e.g., cb --> C♭.
 *
 * @param pitch - Upper or lowecase pitch name with accidentals as ASCII or Unicode.
 * @returns The prettified pitch name.
 */
export function displayPitch(pitch: string): string {
    // Ignore pitch numbers and pitch expressed as Hertz.
    if (typeof pitch === 'number') {
        return pitch;
    }

    let pitchToDisplay: string = pitch[0].toUpperCase();
    if (pitch.length > 2 && pitch.slice(1, 3) === 'bb') {
        pitchToDisplay += DOUBLEFLAT;
    } else if (pitch.length > 1) {
        if (pitch[1] === '#') {
            pitchToDisplay += SHARP;
        } else if (pitch[1].toLowerCase() === 'x') {
            pitchToDisplay += DOUBLESHARP;
        } else if (pitch[1].toLowerCase() === 'b') {
            pitchToDisplay += FLAT;
        }
    }
    return pitchToDisplay;
}

/**
 * Returns whether the pitch is a sharp or not flat?
 *
 * @param pitchName - The pitch name to test.
 * @returns Whether the pitch is sharp or flat.
 */
export function isASharp(pitchName: string): boolean {
    return pitchName.endsWith('#') || PITCH_LETTERS.includes(pitchName);
}

/**
 * Returns the index value of the pitch name.
 *
 * @param pitchName - The pitch name to test.
 * @returns Index into the chromatic scale with sharp notes.
 *
 * @throws {ItemNotFoundError}
 * Thrown if pitchName isn't in chromatic scale.
 */
export function findSharpIndex(pitchName: string): number {
    if (CHROMATIC_NOTES_SHARP.includes(pitchName)) {
        return CHROMATIC_NOTES_SHARP.indexOf(pitchName);
    }

    if (pitchName in CONVERT_UP) {
        const newPitchName = CONVERT_UP[pitchName];
        if (CHROMATIC_NOTES_SHARP.includes(newPitchName)) {
            return CHROMATIC_NOTES_SHARP.indexOf(newPitchName);
        }
    }

    throw new ItemNotFoundError(`Could not find sharp index for ${pitchName}`);
}

/**
 * Returns whether the pitch is a flat or not sharp?
 *
 * @param pitchName - The pitch name to test.
 * @returns Whether the pitch is flat or sharp.
 */
export function isAFlat(pitchName: string): boolean {
    return pitchName.endsWith('b') || PITCH_LETTERS.includes(pitchName);
}

/**
 * Returns the index value of the pitch name.
 *
 * @param pitchName - The pitch name to test.
 * @returns Index into the chromatic scale with sharp notes.
 *
 * @throws {ItemNotFoundError}
 * Thrown if pitchName isn't in chromatic scale.
 */
export function findFlatIndex(pitchName: string): number {
    if (CHROMATIC_NOTES_FLAT.includes(pitchName)) {
        return CHROMATIC_NOTES_FLAT.indexOf(pitchName);
    }

    if (pitchName in CONVERT_DOWN) {
        const newPitchName = CONVERT_DOWN[pitchName];
        if (CHROMATIC_NOTES_FLAT.includes(newPitchName)) {
            return CHROMATIC_NOTES_FLAT.indexOf(newPitchName);
        }
    }

    throw new ItemNotFoundError(`Could not find flat index for ${pitchName}`);
}

/**
 * @remarks
 * Pitches sent to the synth can be specified as a letter name or a number.
 *
 * @param pitchName - The pitch name to test.
 *
 * @throws {InvalidArgumentError}
 * Thrown if pitchName isn't valid.
 */
export function validatePitch(pitchName: string|number) {
    // Only letter names and hertz -- no solfege or generic names
    // since it feeds the synth code.
    if (typeof(pitchName) === 'number') {
       if (pitchName > 0) {
           return;
       }
    } else if (!isNaN(Number(pitchName))) {
        pitchName = Number(pitchName);  // pitch in Hertz
        if (pitchName >= 0) {
            return;
        }
    } else {
        // Must be of the form letter[accidental]ocatve, e.g., f#4.
        if (['c', 'd', 'e', 'f', 'g', 'a', 'b'].indexOf(pitchName.charAt(0)) !== -1) {
            const octave = pitchName.charAt(pitchName.length - 1);
            if (!isNaN(Number(octave)) && Number(octave) > 0) {  // Octave must be a positive int.
                if (pitchName.length === 2) {
                    return;
                }
                if (pitchName.length === 3) {  // There could be an accidental.
                    const accidental = pitchName.charAt(1);
                    if (['#b'].indexOf(accidental) !== -1) {
                        return;
                    }
                }
            }
        }
    }
    throw new InvalidArgumentError('bad pitch value');
}

/**
 * @remarks
 * Pitches can be specified as a letter name, a solfege name, etc.
 *
 * @param pitchName - The pitch name to test.
 * @returns The type of the pitch (letter name, solfege name, generic note name,or east indian
 * solfege name).
 */
export function getPitchType(pitchName: string): string {
    pitchName = normalizePitch(pitchName);

    if (CHROMATIC_NOTES_SHARP.includes(pitchName)) {
        return LETTER_NAME;
    }
    if (CHROMATIC_NOTES_FLAT.includes(pitchName)) {
        return LETTER_NAME;
    }
    if (pitchName in EQUIVALENT_SHARPS) {
        return LETTER_NAME;
    }
    if (pitchName in EQUIVALENT_FLATS) {
        return LETTER_NAME;
    }

    pitchName = stripAccidental(pitchName)[0];

    if (pitchName[0] === 'n' && Number.isInteger(Number(pitchName.slice(1)))) {
        return GENERIC_NOTE_NAME;
    }
    if (SOLFEGE_NAMES.includes(pitchName)) {
        return SOLFEGE_NAME;
    }
    if (EAST_INDIAN_NAMES.includes(pitchName)) {
        return EAST_INDIAN_SOLFEGE_NAME;
    }
    if (SCALAR_MODE_NUMBERS.includes(pitchName)) {
        return SCALAR_MODE_NUMBER;
    }
    return UNKNOWN_PITCH_NAME;
}
