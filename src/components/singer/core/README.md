# Music Utilities

As part of the refactoring of Music Blocks for v4, we are doing an overhaul to the utilties that
support _temperament_ and _key signature_. We further encapsulate most of the complexity of
_tuning_, _key_, _mode_, and _scale_, as well as _transpositions_ and _intervals_ in a
_current pitch_ object.

## Current Pitch

The `CurrentPitch` class in [`currentPitch.ts`](currentPitch.ts) manages pitch state. A pitch is a
note within a scale and temperament (tuning system).

### Constructor

```typescript
/**
 * We need to define a key signature and temperament and a starting point within the scale (and an
 * initial octave value.
 *
 * @param keySignature - `KeySignature` object; defaults to KeySignature(key='c', mode='major').
 * @param temperament - `Temperament` object; defaults to Temperament(name='equal').
 * @param i - Index into semitones defined by temperament; defaults to `7`, which maps to g
 * (sol) in an equal temperament tuning.
 * @param octave - Initial octave for the pitch. Defaults to Octave 4.
 *
 * @throws {ItemNotFoundError}
 * Thrown if solfeges / east indian solfeges / mode numbers do not exist for the temperament's
 * semitone count.
 */
constructor(
    keySignature?: KeySignature,
    temperament?: Temperament,
    i: number = 7,
    octave: number = 4
)
```

### Instance Variables

```typescript
/** Getter for the frequency of the current note in Hertz. */
readonly freq: number;

/** Getter for the octave of the current note. */
readonly octave: number;

/** Getter for the generic name of the current note. */
readonly genericName: string;

/** Getter for the modal index of the current note. */
readonly semitoneIndex: number;

/**
 * Getter for the index of the current note within the list of all of the notes defined by the
 * temperament.
 */
readonly number: number;
```

### Instance Methods

```typescript
/**
 * Sets current pitch to a new pitch by frequency, index and octave or name. These internal states
 * are updated: freq, semitoneIndex, genericName, octave, and number.
 *
 * @param pitchName - The new pitch as a frequency (float), or a modal index (int) and octave or
 * note name (str) and octave. Note names can be 'n7', 'g', 'sol', or, if defined, a custom name.
 * @param octave - The new octave (not needed when pitch is specified by frequency).
 */
public setPitch: (pitchName: number | string, octave: number) => void;

/**
 * Updates the current note by applying a semitone transposition. These internal states are updated:
 * freq, semitoneIndex, genericName, octave, and number.
 *
 * @param numberOfHalfSteps - The transposition in half steps.
*/
public applySemitoneTransposition: (numberOfHalfSteps: number) => void;

/**
 * Updates the current note by applying a scalar transposition. These internal states are updated:
 * freq, semitoneIndex, genericName, octave, and number.
 *
 * @param numberOfScalarSteps - The transposition in scalar steps.
 */
public applyScalarTransposition: (numberOfScalarSteps: number) => void;

/**
 * Calculates the frequency of the note numberOfHalfSteps away from the current note.
 *
 * @param numberOfHalfSteps - The interval in half steps.
 * @returns The frequency of the note at the specified interval.
 */
public getSemitoneInterval: (numberOfHalfSteps: number) => number;

/**
 * Calculates the frequency of the note numberOfScalarSteps away from the current note.
 *
 * @param numberOfScalarSteps - The interval in scalar steps.
 * @returns The frequency of the note at the specified interval.
 */
public getScalarInterval: (numberOfScalarSteps: number) => number;

/**
 * If we are using an equal temperament, we can calculate cents.
 *
 * @param frequency - in hertz
 * @returns PitchTuple [generic note name, octave, cents]
 *
 * @throws {InvalidArgumentError}
 * Thrown if the temperament is not an equal temperament.
 */
public frequencyToPitchOctaveCents: (frequency: number) => PitchTuple;
```

### Description

By default, the `CurrentPitch` object assumes **Equal** temperament tuning and a key signature of
**C Major**. Also, by default, the initial pitch value is **G4**.

```typescript
const cp = new CurrentPitch();
```

There are three ways to change the current pitch:

- assigning a new pitch explicitly

    ```typescript
    cp.setPitch('g', 4);

    cp.setPitch('sol', 4);

    cp.setPitch('n7', 4);

    cp.setPitch(7, 4);

    cp.setPitch(392.0);
    ```

- modifying the current pitch through a semitone transposition

    ```typescript
    cp.applySemitoneTransposition(2);

    cp.applySemitoneTransposition(-12);
    ```

- modifying the current pitch through a scalar transposition

    ```typescript
    cp.applyScalarTransposition(1);

    cp.applyScalarTransposition(-8);
    ```

There are several ways to access the current pitch:

- getting the frequency in Hertz, e.g., 392.0

    ```typescript
    const freq: number = cp.freq;
    ```

- getting the 'generic' note name, e.g., n7

    ```typescript
    const note: string = cp.genericName;
    ```

- getting the current octave, e.g., 4

    ```typescript
    const octave: number = cp.octave;
    ```

- getting the pitch number, e.g., 55

    ```typescript
    const pitchNum: number = cp.number;
    ```

- getting the semitone index, e.g., 7

    ```typescript
    const semitoneIdx: number = cp.semitoneIndex;
    ```

And you can calculate a frequency based on an interval starting from the current pitch, defined in
semitone or scalar steps.

```typescript
const freq: number = cp.getSemitoneInterval(4);

const freq: number = cp.getScalarInterval(2);
```

## Temperament

The `Temperament` class in [`temperament.ts`](temperament.ts) allows generation of new Temperaments.
In musical tuning, temperament is a tuning system that defines the notes (semitones) in an octave.
Most modern Western musical instruments are tuned in the equal temperament system based on the 1/12
root of 2 (12 semitones per octave). Many traditional temperaments are based on ratios.

### Constructor

```typescript
/**
 * @remarks
 * A temperament will be generated but it can subsequently be overriden.
 *
 * @param name - The name of a temperament, e.g., 'equal', 'just intonation'. etc.
 */
constructor(name: string = 'equal')
```

### Instance Variables

```typescript
/** Setter and Getter for the base frequency (in Hertz) used to seed the calculations. */
baseFrequency: number;

/** Setter and Getter for the number of octaves in the temperament. */
numberOfOctaves: number;

/** Getter for the name of the temperament. */
readonly name: string;

/** Getter for the list of all of the frequencies in the temperament. */
readonly freqs: number[];

/** Getter for the list of generic note names. */
readonly noteNames: string[];

/** Getter for the number of notes defined per octave. */
readonly numberOfSemitonesInOctave: number;

/** Getter for the number of notes defined by the temperament. */
readonly numberOfNotesInTemperament: number;
```

### Instance Methods

```typescript
/**
 * Finds the index of the frequency nearest to the target.
 *
 * @param target - The target frequency we are looking for.
 * @returns The index into the freqs array for the entry nearest to the target.
 */
public getNearestFreqIndex: (target: number) => number;

/**
 * Returns the generic note name associated with an index.
 *
 * @param semitoneIndex - Index into generic note names that define an octave.
 * @returns The corresponding note name.
 */
public getNoteName: (semitoneIndex: number) => string;

/**
 * Returns the index associated with a generic note name.
 *
 * @param noteName - The corresponding note name.
 * @returns Index into generic note names that define an octave.
 */
public getModalIndex: (noteName: string) => number;

/**
 * Returns the frequency by an index into the frequency list.
 *
 * @param pitchIndex - The index into the frequency list.
 * @returns The frequency (in Hertz) of a note by index.
 */
public getFreqByIndex: (pitchIndex: number) => number;

/**
 * Converts an index into the frequency list into a modal index and an octave.
 *
 * @param pitchIndex - The index into the frequency list.
 * @returns An array (2-tuple) of the modal index in the scale and the octave.
 */
public getModalIndexAndOctaveFromFreqIndex: (pitchIndex: number) => [number, number];

/**
 * Returns the frequency that corresponds to the index and octave (in Hertz).
 *
 * @remarks
 * Modal index is an index into the notes in a octave.
 *
 * @param modalIndex - The index of the note within an octave.
 * @param octave - Which octave to access.
 */
public getFreqByModalIndexAndOctave: (modalIndex: number, octave: number) => number;

/**
 * @remarks
 * Note name can be used to calculate an index the notes in an octave.
 *
 * @param idx - The index into the frequency list.
 * @returns An array (2-tuple) of the name of the note and which octave to access.
 */
public getGenericNoteNameAndOctaveByFreqIndex: (idx: number) => [string, number];

/**
 * @remarks
 * Note name can be used to calculate an index the notes in an octave.
 *
 * @param noteName - The name of the note.
 * @param octave - Which octave to access.
 * @returns The index into the frequency list.
 *
 * @throws {ItemNotFoundError}
 * Thrown if note name does not exist in list of generic note names.
 */
public getFreqIndexByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;

/**
 * @remarks
 * Note name can be used to calculate an index the notes in an octave.
 *
 * @param noteName - The name of the note.
 * @param octave - Which octave to access.
 * @returns The frequency that corresponds to the index and octave (in Hertz).
 */
public getFreqByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;

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
public generate: (name: string) => void;

/**
 * @remarks
 * Equal temperaments can be generated for different numbers of steps between the notes in an
 * octave. The predefined equal temperament defines 12 steps per octave, which is perhaps the
 * most common tuning system in modern Western music. But any number of steps can be used.
 *
 * @param numberOfSteps - The number of equal steps into which to divide an octave.
 */
public generateEqualTemperament: (numberOfSteps: number) => void

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
public generateCustom: (
    intervals: string[],
    ratios: { [key: string]: number },
    name: string = 'custom'
) => void

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
public tune: (pitchName: string, octave: number, frequency: number) => number
```

### Description

By default, the Temperament object creates an equal temperament based on 2<sup>1/12</sup>, with a
starting frequency of C0 = 16.3516 Hz. 9 octaves of 12 semitones are generated. Many other
predefined temperaments are available and equal temperament can also be generated for other powers
of 2. For example, 2^^(1/24) would produce quarter steps. Also, the temperament can be tuned to a
different base pitch.

The built-in temperaments are:

- `'equal'`
- `'just intonation'`
- `'pythagorean'`
- `'third comma meantone'`
- `'quarter comma meantone'`

```typescript
const t: Temperament = new Temperament('equal');
```

To tune to a different base frequency:

```typescript
t.tune('a', 4, 441);
```

A generic name is defined for each note in the octave. The convention is `n0`, `n1`, etc. These
notes can be used by the getFreqByGenericNoteNameAndOctave method to retrieve a frequency by note
name and octave.

```typescript
const freq: number = t.getFreqByGenericNoteNameAndOctave('n7', 4);
```

You may need to know the number of semitones in an octave and the number of notes in the temperament.

```typescript
const numberOfSemitones: number = t.numberOfSemitonesInOctave;
const numberOfNotes: number = t.numberOfNotesInTemperament;
```

And the note name from an index ...

```typescript
const genericName: string = t.getNoteName(semitoneIndex);
```

You can get the pitch number from a frequency and a frequency from an index.

```typescript
const pitchNumber: number = t.getNearestFreqIndex(freq);
const freq: number = t.getFreqByIndex(pitchNumber);
```

## Scale

The `Scale` class in [`scale.ts`](scale.ts) allows defining a scale. A scale is a selection
of notes in an octave.

### Constructor

```typescript
/**
 * @remarks
 * When defining a scale, we need the half steps pattern that defines the selection and a starting
 * note, e.g., C or F#.
 *
 * @param halfStepsPattern - A list of integer values that define how many half steps to take
 * between each note in the scale, e.g., [2, 2, 1, 2, 2, 2, 1] defines the steps for a Major scale.
 * @param startingIndex - An index into the half steps defining an octave that determines from where
 * to start building the scale, e.g., 0 for C and 7 for G in a 12-step temperament. Defaults to `0`.
 * @param numberOfSemitones - If the `halfStepsPattern` is an empty list, then use the number of
 * semitones instead. (Or trigger a mapping from 12 to 21.) Defaults to `12`.
 * @param preferSharps - If we are mapping from 12 to 21 semitones, we need to know whether or not
 * to prefer sharps or flats. Defaults to `true`.
 */
constructor(
    halfStepsPattern: number[] | null = null,
    startingIndex: number = 0,
    numberOfSemitones: number = 12,
    preferSharps: boolean = true
)
```

### Instance Variables

```typescript
/** Getter for the number of notes in the scale. */
readonly numberOfSemitones: number;

/** Getter for the notes defined by the temperament. */
readonly noteNames: string[];
```

### Instance Methods

```typescript
/**
 * Returns the notes in the scale.
 *
 * @param pitchFormat - Array of letter names in the teperament.
 *
 * @throws {FormatMismatchError}
 * Thrown if `pitchFormat` length does not match number of semitones.
 */
public getScale: (pitchFormat?: string[]) => string[];

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
 * @throws {FormatMismatchError}
 * Thrown if `pitchFormat` length does not match number of semitones.
 */
public getScaleAndOctaveDeltas: (pitchFormat?: string[]) => [string[], number[]];
```

### Description

The Scale object holds the list of notes defined in the scale defined by a key and mode. While it is
unlikely you'll need to access this object directly, there are public getters available for
accessing the notes in a scale as an array, the number of notes in the scale, and the octave offsets
associated with a scale (new octaves always start at `C` regardless of the temperament, key, or mode.

## KeySignature

The `KeySignature` class in [`keysignature.ts`](keysignature.ts) allows defining a scale. A key
signature is a set of _sharp_, _flat_, and _natural_ symbols.

### Constructor

```typescript
/**
 * @remarks
 * In defining a scale, we need to know the key, the mode, and the number of notes in the
 * temperament used to define the scale.
 *
 * @param modeArg - One of the modes defined in `this.MUSICAL_MODES`.
 * @param key - Any pitch defined by the temperament. (Note that currently the only notation
 * supported is for temperaments with up to 12 steps.
 * @param numberOfSemitones - The number of semitones defined in the temperament.
 *
 * @throws {ItemNotFoundError}
 * Thrown if solfeges / east indian solfeges / mode numbers do not exist for temperaments with
 * `numberOfSemitones` semitones.
 */
constructor(
    modeArg: string | number[] = 'major',
    key: string = 'c',
    numberOfSemitones: number = 12
)
```

### Instance Variables

```typescript
/** Getter for the pitch currently defined by the temperament. */
readonly key: string;

/** Getter for the current temperament mode. */
readonly mode: string;

/** Getter for the current "key mode" pair. */
readonly keySignature: string;

/** Getter for the list of notes in the scale. */
readonly scale: string[];

/** Setter and Getter for the state of fixed solfege. */
fixedSolfege: boolean;

/** Getter for the solfege notes in mode. */
readonly solfegeNotes: string[];

/** Getter for the number of (scalar) notes are in the scale? */
readonly modeLength: number;

/** Getter for the number of semitones (half-steps) in the temperament. */
readonly numberOfSemitones: number;

/** Getter and Setter for custom note names defined by the user. */
customNoteNames: string[];
```

### Instance Methods

```typescript
/**
 * Normalizes the scale by converting double sharps and double flats.
 *
 * @param scale - The notes in a scale.
 * @returns The same scale where the notes have been converted to just sharps, flats, and naturals.
 */
pubilc normalizeScale: (scale: string[]) => string[];

/**
 * Checks pitch type, including test for custom names.
 *
 * @param pitchName - pitch name to test
 * @returns pitch type, e.g., LETTER_NAME, SOLFEGE_NAME, etc.
 */
public pitchNameType: (pitchName: string) => string;

/**
 * Converts from a letter name used by 12-semitone temperaments to a generic note name as defined by
 * the temperament.
 *
 * @remarks
 * Only for temperaments with 12 semitones.
 *
 * @param pitchName - name of pitch.
 * @returns An array (2-tuple) of
 *  - Generic note name.
 *  - Error code.
 *
 * @throws {ItemNotFoundDefaultError<string>}
 * Thrown if the supplied pitch name does not match any type.
 */
public convertToGenericNoteName: (pitchName: string) => string;

/**
 * Given a modal number, returns the corresponding pitch in the scale (and any change in octave).
 *
 * @param modalIndex - The modal index specifies an index into the scale.
 * If the index is >= mode length or < 0, a relative change in octaveis also calculated.
 * @returns
 * An array (2-tuple) of
 *  - The pitch that is the result of indexing the scale by the modal index.
 *  - The relative change in octave due to mapping the modal index to the mode length.
 */
public modalPitchToLetter: (modalIndex: number) => [string, number];

/**
 * Given a pitch, checks to see if it is in the scale.
 *
 * @param target - The target pitch specified as a pitch letter, e.g., c#, fb.
 * @returns `true` if the note is in the scale, `false` otherwise.
 */
public noteInScale: (target: string) => boolean;

/**
 * Given a starting pitch, adds a semitone transform and return the resultant pitch (and any
 * change in octave).
 *
 * @param startingPitch - The starting pitch specified as a pitch letter, e.g., c#, fb.
 * @param numberOfHalfSteps - Half steps are steps in the notes defined by the temperament.
 * @returns
 * An array (3-tuple) of
 *  - The pitch that is the number of half steps from the starting pitch.
 *  - The relative change in octave between the starting pitch and the new pitch.
 *  - Error code.
 *
 * @throws {ItemNotFoundDefaultError<[string, number]>}
 * Thrown if the starting pitch is not a part of list of note names of the mode.
 */
public semitoneTransform: (startingPitch: string, numberOfHalfSteps: number) => [string, number];

/**
 * Given a starting pitch, adds a scalar transform and returns the resultant pitch (and any
 * change in octave).
 *
 * @param startingPitch - The starting pitch specified as a pitch letter, e.g., c#, fb.
 * Note that the starting pitch may or may not be in the scale.
 * @param numberOfScalarSteps - Scalar steps are steps in the scale (as opposed to half-steps).
 * @returns
 * An array (3-tuple) of
 *  - The pitch that is the number of scalar steps from the starting pitch.
 *  - The relative change in octave between the starting pitch and the new pitch.
 *  - Error code.
 */
public scalarTransform: (startingPitch: string, numberOfScalarSteps: number) => [string, number];

/**
 * Given a generic note name, converts it to a pitch name type.
 *
 * @param pitchName - Source generic note name.
 * @param targetType - One of the predefined types, e.g., LETTER_NAME, SOLFEGE_NAME, etc.
 * @param preferSharps - If there is a choice, should we use a sharp or a flat?
 * @returns Converted note name.
 */
public genericNoteNameConvertToType: (
    pitchName: string,
    targetType: string,
    preferSharps: boolean
) => string;

/**
 * Calculates the distance between two notes in semitone steps.
 *
 * @param pitchA - Pitch name one of two.
 * @param octaveA - Octave number one of two.
 * @param pitchB - Pitch name two of two.
 * @param octaveB - Octave number two of two.
 * @returns Distance calculated in scalar steps.
 */
public semitoneDistance: (pitchA: string, octaveA: number, pitchB: string, octaveB: number) => number;

/**
 * Calculates the distance between two notes in scalar steps.
 *
 * @param pitchA - Pitch name one of two.
 * @param octaveA - Octave number one of two.
 * @param pitchB - Pitch name two of two.
 * @param octaveB - Octave number two of two.
 * @returns
 * An array (2-tuple) of
 *  - Distance calculated in scalar steps.
 *  - Any semitone rounding error in the calculation.
 */
public scalarDistance: (
    pitchA: string,
    octaveA: number,
    pitchB: string,
    octaveB: number
) => [number, number];

/**
 * Rotates a series of notes around an invert point.
 *
 * @param pitchName - The pitch name of the note to be rotated.
 * @param octave - The octave of the note to be rotated.
 * @param invertPointPitch - The pitch name of the axis of inversion.
 * @param invertPointOctave - The octave of the axis of inversion.
 * @param invertMode - There are three different invert modes:
 * `even`, `odd`, and `scalar`. In even and odd modes, the rotation is based on half steps. In
 * even and scalar mode, the point of rotation is the given note. In odd mode, the point of
 * rotation is shifted up by a 1/4 step, enabling rotation around a point between two notes. In
 * scalar mode, the scalar interval is preserved around the point of rotation.
 * @returns
 * An array (2-tuple)
 *  - Pitch name of the inverted note.
 *  - Octave of the inverted note.
 */
public invert: (
    pitchName: string,
    octave: number,
    invertPointPitch: string,
    invertPointOctave: number,
    invertMode: 'even' | 'odd' | 'scalar'
) => [string, number];

/**
 * Given a target pitch, what is the closest note in the current key signature (key and mode)?
 *
 * @param target - target pitch specified as a pitch letter, e.g., c#, fb
 * @returns
 * An array (4-tuple) of
 *  - The closest pitch to the target pitch in the scale.
 *  - The scalar index value of the closest pitch in the scale (If the target is midway between
 *      two scalar pitches, the lower pitch is returned.)
 *  - The distance in semitones (half steps) from the target pitch to the scalar pitch (If the
 *      target is higher than the scalar pitch, then distance > 0. If the target is lower than
 *      the scalar pitch then distance < 0. If the target matches a scale pitch, then distance
 *      is 0.)
 *
 * @throws {ItemNotFoundDefaultError<[string, number, number]>}
 * Thrown if distance is not less than number of semitones, or target note not part of list of note
 * names for the current mode.
 */
public closestNote: (target: string) => [string, number, number];
```

### Description

Key Signatures are defined by a key and a mode, e.g. `C Major`. This is used to define which
semitones (half steps) in an octave are in the scale.

```typescript
const ks: KeySignature = new KeySignature('major', 'c');
```

By default, the Key Signature object assumes that there are 12 semitones per octave, but this can be
overriden for temperaments with other configurations, e.g. the meantone temperaments.

```typescript
const ks: KeySignature = new KeySignature('major', 'c', 12);
```

Within each Key Signature object is a Scale object, which is defined by the key and mode at the time
of instantiation.

```typescript
const scale: string[] = ks.scale;
```

Key Signature supports a variety of naming schemes, including the generic note names used by the
`Temperament` object, letter names, both fixed and moveable Solfege, East Indian Solfege, scale
degree, and custom defined names (The pitch name types are defined in `musicutils.ts`).

```typescript
ks.customNoteNames = ['charlie', 'delta', 'echo', 'foxtrot', 'golf', 'alfa', 'bravo'];

let genericName: string;
genericName = ks.convertToGenericNoteName('g')
genericName = ks.convertToGenericNoteName('sol')
genericName = ks.convertToGenericNoteName('5')
genericName = ks.convertToGenericNoteName('pa')
genericName = ks.convertToGenericNoteName('golf')

const letterName: string = ks.genericNoteNameConvertToType('n7', LETTER_NAME); // 'g'
const solfegeName: string = ks.genericNoteNameConvertToType('n7', SOLFEGE_NAME); // 'sol'
const eiSolfegeName: string = ks.genericNoteNameConvertToType('n7', EAST_INDIAN_SOLFEGE_NAME); // 'pa'
const customName: string = ks.genericNoteNameConvertToType('n7', CUSTOM_NAME); // 'golf'
const scalarModeNumber: string = ks.genericNoteNameConvertToType('n7', SCALAR_MODE_NUMBER) // '5';
```

Fixed Solfege means that the mapping between Solfege and letter names is fixed: do == c, re == d, ...

Moveable (not fixed) Solfege means that do == the first note in the scale, etc.

```typescript
const ks: KeySignature = KeySignature('major', 'g');
let genericName: string;
genericName = ks.convertToGenericNoteName('sol')[0]; // 'n7'
ks.fixedSolfege = false; // Moveable
genericName = ks.convertToGenericNoteName('do')[0]; // 'n7'
```

The Key Signature is used to navigate the scale, either by scalar or semitone steps.

```typescript
let genericName: string, deltaOctave: number;
[genericName, deltaOctave] = ks.semitoneTransform(startingPitch, numberOfHalfSteps);
[genericName, deltaOctave] = ks.scalarTransform(startingPitch, numberOfScalarSteps);
```

## Music Utils

The constants and the utilities retated to musical state in [`musicUtils.ts`](musicUtils.ts) are
required by other related modules.

### Constants

```typescript
const SHARP: string = '♯';
const FLAT: string = '♭';
const NATURAL: string = '♮';
const DOUBLESHARP: string = '𝄪';
const DOUBLEFLAT: string = '𝄫';

const CHROMATIC_NOTES_SHARP: string[] = [
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
    'b'
];

const CHROMATIC_NOTES_FLAT: string[] = [
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
    'b'
];

/**
 * @remarks
 * Meantone temperaments use 21 notes.
 */
const ALL_NOTES: string[] = [
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
    'cb'
];

const SCALAR_MODE_NUMBERS: string[] = ['1', '2', '3', '4', '5', '6', '7'];

const SOLFEGE_NAMES: string[] = ['do', 're', 'me', 'fa', 'sol', 'la', 'ti'];

const EAST_INDIAN_NAMES: string[] = ['sa', 're', 'ga', 'ma', 'pa', 'dha', 'ni'];

const EQUIVALENT_FLATS: { [key: string]: string } = {
    'c#': 'db',
    'd#': 'eb',
    'f#': 'gb',
    'g#': 'ab',
    'a#': 'bb',
    'e#': 'f',
    'b#': 'c',
    'cb': 'cb',
    'fb': 'fb'
};

const EQUIVALENT_SHARPS: { [key: string]: string } = {
    'db': 'c#',
    'eb': 'd#',
    'gb': 'f#',
    'ab': 'g#',
    'bb': 'a#',
    'cb': 'b',
    'fb': 'e',
    'e#': 'e#',
    'b#': 'b#'
};

/**
 * @remarks
 * This notation only applies to temperaments with 12 semitones.
 */
const PITCH_LETTERS: string[] = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

/**
 * @remarks
 * These defintions are only relevant to equal temperament.
 */
const SOLFEGE_SHARP: string[] = [
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
    'ti'
];

const SOLFEGE_FLAT: string[] = [
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
    'ti'
];

const EAST_INDIAN_SHARP: string[] = [
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
    'ni'
];

const EAST_INDIAN_FLAT: string[] = [
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
    'ni'
];

const SCALAR_NAMES_SHARP: string[] = [
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
    '7'
];

const SCALAR_NAMES_FLAT: string[] = [
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
    '7'
];

const EQUIVALENTS: { [key: string]: string[] } = {
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
    'gbb': ['f', 'e#']
};

const CONVERT_DOWN: { [key: string]: string } = {
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
    bbb: 'a'
};

const CONVERT_UP: { [key: string]: string } = {
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
    'b': 'cb'
};

// Pitch name types

const GENERIC_NOTE_NAME = 'generic note name';
const LETTER_NAME = 'letter name';
const SOLFEGE_NAME = 'solfege name';
const EAST_INDIAN_SOLFEGE_NAME = 'east indian solfege name';
const SCALAR_MODE_NUMBER = 'scalar mode number';
const CUSTOM_NAME = 'custom name';
const UNKNOWN_PITCH_NAME = 'unknown';
```

### Functions

```typescript
/**
 * Removes an accidental and return the number of half steps that would have resulted from its
 * application to the pitch.
 *
 * @param pitch - Upper or lowecase pitch name with accidentals as ASCII or Unicode.
 * @returns An array (2-tuple) of the normalized pitch name and the change in half steps represented
 * by the removed accidental.
 */
function stripAccidental: (pitch: string) => [string, number];

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
function normalizePitch: (pitch: string) => string;

/**
 * Returns a pretty pitch name.
 *
 * @remarks
 * The internal pitch name is converted to unicode, e.g., cb --> C♭.
 *
 * @param pitch - Upper or lowecase pitch name with accidentals as ASCII or Unicode.
 * @returns The prettified pitch name.
 */
function displayPitch: (pitch: string) => string;

/**
 * Returns whether the pitch is a sharp or not flat?
 *
 * @param pitchName - The pitch name to test.
 * @returns Whether the pitch is sharp or flat.
 */
function isASharp: (pitchName: string) => boolean;

/**
 * Returns the index value of the pitch name.
 *
 * @param pitchName - The pitch name to test.
 * @returns Index into the chromatic scale with sharp notes.
 *
 * @throws {ItemNotFoundError}
 * Thrown if pitchName isn't in chromatic scale.
 */
function findSharpIndex: (pitchName: string) => number;

/**
 * Returns whether the pitch is a flat or not sharp?
 *
 * @param pitchName - The pitch name to test.
 * @returns Whether the pitch is flat or sharp.
 */
function isAFlat: (pitchName: string) => boolean;

/**
 * Returns the index value of the pitch name.
 *
 * @param pitchName - The pitch name to test.
 * @returns Index into the chromatic scale with sharp notes.
 *
 * @throws {ItemNotFoundError}
 * Thrown if pitchName isn't in chromatic scale.
 */
function findFlatIndex: (pitchName: string) => number;

/**
 * @remarks
 * Pitches sent to the synth can be specified as a letter name or a number.
 *
 * @param pitchName - The pitch name to test.
 *
 * @throws {InvalidArgumentError}
 * Thrown if pitchName isn't valid.
 */
export function validatePitch(pitchName: string|number) ==> void;

/**
 * @remarks
 * Pitches can be specified as a letter name, a solfege name, etc.
 *
 * @param pitchName - The pitch name to test.
 * @returns The type of the pitch (letter name, solfege name, generic note name,or east indian
 * solfege name).
 */
function getPitchType: (pitchName: string) => string;
```

## Synth Utils

Synth Utils class in [`synthUtils.ts`](synthUtils.ts) is used to manage the synthesizers used
by MusicBlocks.

### Constructor

```typescript
export default class SynthUtils implements ISynthUtils {}
```

The constructor preps the synths for Voice 0.

### Functions

```typescript
/**
  * @remarks
  * Get the synth for a given instrument name and instance.
  *
  * @param instrumentName is the name of a builtin synth (e.g., polySynth)
  * @param instance is the voice number associated with the synth
  *
  * @throws {InvalidArgumentError}
  */
public getBuiltinSynth(instrumentName: string, instance: number): Tone.PolySynth | undefined {}

/**
  * @remarks
  * Get the synth for a given instrument name and instance.
  *
  * @param instrumentName is the name of an instrument synth
  * @param instance is the voice number associated with the synth
  *
  * @throws {InvalidArgumentError}
  */
public getSampler(instrumentName: string, instance: number): Tone.Sampler | undefined {}

/**
  * @remarks
  * Get the synth for a given instrument name and instance.
  *
  * @param instrumentName is the name of a sample.
  * @param instance is the voice number associated with the synth
  *
  * @throws {InvalidArgumentError}
  */
public getPlayer(instrumentName: string, instance: number): Tone.Player | undefined {}

/**
  * @remarks
  * Creates synths for a new voice (if it doesn't already exist)
  * and sets the default values for the voice parameters.
  */
public addVoice(instance: number) {}

/**
 * Convert from note value to seconds
 *
 * @param noteValue - 1/4, 1/8 etc.
 * @param instance is needed for accessing the beat information
 **/
public noteValueToSeconds(noteValue: number, instance: number): number {}

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
) {}
```

## Example

Putting it all together ...

```typescript
import Temperament from './temperament';
import KeySignature from './keySignature';
import CurrentPitch from './currentPitch';

// Use the default tuning (Equal temperament) and the default key and mode (C Major).
let cp = new CurrentPitch();
console.log(cp.freq, '\n');

// Use Pythagorean tuning and G Major.
const t = new Temperament('pythagorean');
const ks = new KeySignature('major', 'g');
cp = new CurrentPitch(ks, t);
console.log(cp.freq, '\n');

// Walk through the scale.
const modeLength = ks.modeLength;
console.log(cp.freq);
for (let i = 0; i < modeLength; i++) {
    cp.applyScalarTransposition(1);
    console.log(cp.freq);
}
console.log('\n');

// Set the current pitch to G4.
cp.setPitch('g', 4);
console.log(cp.toString());
```

The default settings are Equal temperament, C Major, and G4. This results in a frequency of
`391.99548797210804`.

Switching to Pythagorean tuning results in G4 mapping to `403.21972995787394`.

The frequencies in G Major (Octave 4) are:

```typescript
403.21972995787394
453.62219620260817
510.3249707279342
268.8131533052493
302.4147974684054
335.6374564664841
377.59213852479456
806.439459915748
```

Setting the current note back to G4: `n7 403.21972995787394`
