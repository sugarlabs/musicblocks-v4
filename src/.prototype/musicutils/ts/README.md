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
 * @param keySignature - `KeySignature` object; defaults to KeySignature(key="c", mode="major").
 * @param temperament - `Temperament` object; defaults to Temperament(name="equal").
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
freq: number;

/** Getter for the octave of the current note. */
octave: number;

/** Getter for the generic name of the current note. */
genericName: string;

/** Getter for the modal index of the current note. */
semitoneIndex: number;

/**
 * Getter for the index of the current note within the list of all of the notes defined by the
 * temperament.
 */
number: number;
```

### Instance Methods

```typescript
/**
 * Sets current pitch to a new pitch by frequency, index and octave or name. These internal states
 * are updated: freq, semitoneIndex, genericName, octave, and number.
 *
 * @param pitchName - The new pitch as a frequency (float), or a modal index (int) and octave or
 * note name (str) and octave. Note names can be "n7", "g", "sol", or, if defined, a custom name.
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
    cp.setPitch("g", 4);

    cp.setPitch("sol", 4);

    cp.setPitch("n7", 4);

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

- getting the "generic" note name, e.g., n7

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
 * @param name - The name of a temperament, e.g., "equal", "just intonation". etc.
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
name: string;

/** Getter for the list of all of the frequencies in the temperament. */
freqs: number[];

/** Getter for the list of generic note names. */
noteNames: string[];

/** Getter for the number of notes defined per octave. */
numberOfSemitonesInOctave: number;

/** Getter for the number of notes defined by the temperament. */
numberOfNotesInTemperament: number;
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

- `"equal"`
- `"just intonation"`
- `"pythagorean"`
- `"third comma meantone"`
- `"quarter comma meantone"`

```typescript
const t: Temperament = Temperament("equal")
```

To tune to a different base frequency:

```typescript
t.tune("a", 4, 441)
```

A generic name is defined for each note in the octave. The convention is `n0`, `n1`, etc. These
notes can be used by the getFreqByGenericNoteNameAndOctave method to retrieve a frequency by note
name and octave.

```typescript
const freq: number = t.getFreqByGenericNoteNameAndOctave("n7", 4)
```

You may need to know the number of semitones in an octave and the number of notes in the temperament.

```typescript
const numberOfSemitones: number = t.numberOfSemitonesInOctave
const numberOfNotes: number = t.numberOfNotesInTemperament
```

And the note name from an index ...

```typescript
const genericName: string = t.getNoteName(semitoneIndex)
```

You can get the pitch number from a frequency and a frequency from an index.

```typescript
const pitchNumber: number = t.getNearestFreqIndex(freq)
const freq: number = t.getFreqByIndex(pitchNumber)
```
