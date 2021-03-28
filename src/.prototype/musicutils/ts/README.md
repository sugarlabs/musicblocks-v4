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
    freq = cp.freq;
    ```

- getting the "generic" note name, e.g., n7

    ```typescript
    note = cp.genericName;
    ```

- getting the current octave, e.g., 4

    ```typescript
    octave = cp.octave;
    ```

- getting the pitch number, e.g., 55

    ```typescript
    pitchNum = cp.number;
    ```

- getting the semitone index, e.g., 7

    ```typescript
    semitoneIdx = cp.semitoneIndex;
    ```

And you can calculate a frequency based on an interval starting from the current pitch, defined in
semitone or scalar steps.

```typescript
freq = cp.getSemitoneInterval(4);

freq = cp.getScalarInterval(2);
```
