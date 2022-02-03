Music Utilities
===============

As part of the refactoring of Music Blocks, we are doing an overhaul
to the utilties that support temperament and key signature. We further
encapsulate most of the complexity of tuning, key, mode, and scale, as
well as transpositions and intervals in a "current pitch" object.

Curent Pitch
------------

```python
class CurrentPitch:
    """
    A pitch is a note within a scale and temperament (tuning system).
    """

    def __init__(self, keysignature=None, temperament=None, i=7, octave=4):
        """
        We need to define a key signature and temperament and a starting
        point within the scale (and an initial octave value.

        keysignature : obj
            KeySignature object; defaults to KeySignature(key="c", mode="major")

        temperament : obj
            Temperament object; defaults to Temperament(name="equal")

        i : int
            Index into semitones defined by temperament; defaults to 7, which
            maps to g (sol) in an equal temperament tuning

        octave : int
            Initial octave for the pitch. Defaults to Octave 4
        """

    def set_pitch(self, pitch_name, octave=4):
        """
        Set current pitch to a new pitch by frequency, index and octave or
        name. These internal states are updates: freq, semitone_index,
        generic_name, octave, and number.

        Parameters
        ----------
        pitch_name : float or int or str
            The new pitch as a frequency (float), or a modal index (int) and
            octave or note name (str) and octave.
            Note names can be "n7", "g", "sol", or, if defined, a custom name.

        octave : int
            The new octave (not needed when pitch is specified by frequency)
        """

    def apply_semitone_transposition(self, number_of_half_steps):
        """
        Update the current note by applying a semitone transposition.
        These internal states are updates: freq, semitone_index,
        generic_name, octave, and number.

        Parameters
        ----------
        number_of_half_steps : int
            The transposition in half steps
        """

    def apply_scalar_transposition(self, number_of_scalar_steps):
        """
        Update the current note by applying a scalar transposition.
        These internal states are updates: freq, semitone_index,
        generic_name, octave, and number.

        Parameters
        ----------
        number_of_scalar_steps : int
            The transposition in scalar steps
        """

    def get_semitone_interval(self, number_of_half_steps):
        """
        Calculate the frequency of the note number_of_half_steps
        away from the current note.

        Parameters
        ----------
        number_of_half_steps : int
            The interval in half steps

        Returns
        -------
        float
            The frequency of the note at the specified interval.
        """

    def get_scalar_interval(self, number_of_scalar_steps):
        """
        Calculate the frequency of the note number_of_scalar_steps
        away from the current note.

        Parameters
        ----------
        number_of_scalar_steps : int
            The interval in scalar steps

        Returns
        -------
        float
            The frequency of the note at the specified interval.
        """

    def get_freq(self):
        """
        Returns
        -------
        float
            The frequency of the current note in Hertz
        """

    def get_octave(self):
        """
        Returns
        -------
        int
            The octave of the current note
        """

    def get_generic_name(self):
        """
        Returns
        -------
        str
            The generic name of the current note
        """

    def get_semitone_index(self):
        """
        Returns
        -------
        int
            The modal index of the current note
        """

    def get_number(self):
        """
        Returns
        -------
        int
            The index of the current note within the list of all of the
            notes defined by the temperament
        """
```

By default, the current pitch object assumes `Equal` temperament tuning
and a key signature of `C Major`. Also, by default, the initial pitch
value is `G4`.

```python
cp = CurrentPitch()
```

There are three ways to change the current pitch:

* assigning a new pitch explicitly
* modifying the current pitch through a semitone transposition
* modifying the current pitch through a scalar transposition

```python
cp.set_pitch("g", 4)

cp.set_pitch("sol", 4)

cp.set_pitch("n7", 4)

cp.set_pitch(7, 4)

cp.set_pitch(392.0)
```

```python
cp.apply_semitone_transposition(2)

cp.apply_semitone_transposition(-12)
```

```python
cp.apply_scalar_transposition(1)

cp.apply_scalar_transposition(-8)
```

There are several ways to access the current pitch:

* getting the frequency in Hertz, e.g., 392.0
* getting the "generic" note name, e.g., n7
* getting the current octave, e.g., 4
* getting the pitch number, e.g., 55
* getting the semitone index, e.g., 7

```python
freq = cp.get_freq()
```

And you can calculate a frequency based on an interval starting from
the current pitch, defined in semitone or scalar steps.

```python
freq = cp.get_semitone_interval(4)

freq = cp.get_scalar_interval(2)
```

Temperament
-----------

```python
class Temperament:
    """
    In musical tuning, temperament is a tuning system that defines the
    notes (semitones) in an octave. Most modern Western musical
    instruments are tuned in the equal temperament system based on the
    1/12 root of 2 (12 semitones per octave). Many traditional
    temperaments are based on ratios.
    """

    def __init__(self, name="equal", octave_ratio=2):
        """
        Initialize the class. A temperament will be generated but it can
        subsequently be overriden.

        Parameters
        ----------

        name : str
            The name of a temperament, e.g., "equal", "just intonation". etc.

        octave_ratio : float
            The ratio between octaves (2 by default)
        """

    def set_octave_ratio(self, octave_ratio):
        """
        The octave ratio is used to determine the size of an octave. By
        default, it is 2:1, so going up by one octave will double the
        frequency. But this can be overriden.

        Parameters
        ----------
        octave_ratio : float
        The ratio between octaves
        """

    def tune(self, pitch_name, octave, frequency):
        """
        Calculate a base frequency based on a pitch and frequency.

        Parameters
        ----------
        pitch_name : str
            Pitch name, e.g. A#

        octave : int
            Octave

        frequency : float
            Frequency from which to calculate the new base frequency

        Results
        -------
        float
            New base frequency for C0
        """

    def set_base_frequency(self, base_frequency):
        """
        The base frequency is used as the starting point for generating
        the notes.

        Parameters
        ----------
        base_frequency : float
            The frequency (in Hertz) used to seed the calculation of the
            notes used in the temperament.
        """

    def get_base_frequency(self):
        """
        Returns
        -------
        float
            The base frequency (in Hertz) used to seed the calculations
        """

    def set_number_of_octaves(self, number_of_octaves=8):
        """
        How many octaves are defined for the temperament?

        Parameters
        ----------
        number_of_octaves : int
            The number of octaves in the temperament. (8 octaves in
            equal temperament would span 96 notes).
        """

    def get_number_of_octaves(self):
        """
        Returns
        -------
        int
            The number of octaves in the temperament.
        """

    def get_name(self):
        """
        Returns
        -------
        str
            The name of the temperament
        """

    def get_freqs(self):
        """
        freqs is the list of all of the frequencies in the temperament.

        Returns
        -------
        list
            A list of frequencies in Hertz (float)
        """

    def get_nearest_freq_index(self, target):
        """
        Find the index of the frequency nearest to the target.

        Parameters
        ----------
        target : float
            The target frequency we are looking for.

        Returns
        -------
        int
            The index into the freqs array for the entry nearest to the target.
        """

    def get_note_names(self):
        """
        Generic note names are assigned to define a chromatic scale.

        Returns
        -------
        list
            A list of note names (str)
        """

    def get_note_name(self, semitone_index):
        """
        Return the generic note name associated with an index.

        Parameters
        __________
        semitone_index : int
            Index into generic note names that define an octave

        Returns
        -------
        str
           The corresponding note name
        """

    def get_modal_index(self, note_name):
        """
        Return the index associated with a generic note name.

        Parameters
        __________
        note_name : str
           The corresponding note name

        Returns
        -------
        int
            Index into generic note names that define an octave
        """

    def get_freq_by_index(self, pitch_index):
        """
        Return the frequency by an index into the frequency list.

        Parameters
        ----------
        pitch_index : int
            The index into the frequency list

        Returns
        -------
        float
            Returns the frequency (in Hertz) of a note by index
        """

    def get_freq_index_by_generic_note_name_and_octave(self, note_name, octave):
        """
        Note name can be used to calculate an index the notes in an octave.

        Parameters
        ----------
        note_name : str
            The name of the note

        octave : int
            Which octave to access

        Returns
        -------
        int
            The index into the frequency list
        """

    def get_generic_note_name_and_octave_by_freq_index(self, idx):
        """
        Note name can be used to calculate an index the notes in an octave.

        Parameters
        ----------
        idx : int
            The index into the frequency list

        Returns
        -------
        str
            The name of the note

        int
            Which octave to access
        """

    def get_modal_index_and_octave_from_freq_index(self, pitch_index):
        """
        Convert an index into the frequency list into a modal index
        and an octave.

        Parameters
        ----------
        pitch_index : int
            The index into the frequency list

        Returns
        -------
        int
            the modal index in the scale
        int
            the octave
        """

    def get_freq_by_modal_index_and_octave(self, modal_index, octave):
        """
        Modal index is an index into the notes in a octave.

        Parameters
        ----------
        modal_index : int
            The index of the note within an octave

        octave : int
            Which octave to access

        Returns
        -------
        float
            The frequency that corresponds to the index and octave (in Hertz)
        """

    def get_freq_by_generic_note_name_and_octave(self, note_name, octave):
        """
        Note name can be used to calculate an index the notes in an octave.

        Parameters
        ----------
        note_name : str
            The name of the note

        octave : int
            Which octave to access

        Returns
        -------
        float
            The frequency that corresponds to the index and octave (in Hertz)
        """

    def get_number_of_semitones_in_octave(self):
        """
        Returns
        -------
        int
            The number of notes defined per octave
        """

    def get_number_of_notes_in_temperament(self):
        """
        Returns
        -------
        int
            The number of notes defined by the temperament
        """

    def generate_generic_note_names(self):
        """
        """

    def generate(self, name):
        """
        Generate creates one of the predefined temperaments based on the
        rules for generating the frequencies and the selected intervals used
        to determine which frequencies to include in the temperament.
        A rule might be to use a series of ratios between steps, as in the
        Pythagorean temperament, or to use a fixed ratio, such as the
        twelth root of two when calculating equal temperament.

        The base frequency used when applying the rules is defined in
        self.base_frequency
        The number of times to apply the rules is determined by
        self.number_of_octaves
        The resultant frequencies are stored in self.freqs
        The resultant number of notes per octave is stored in
        self.octave_length

        Parameters
        ----------
        name : str
            The name of one of the predefined temperaments
        """

    def generate_equal_temperament(self, number_of_steps):
        """
        Equal temperaments can be generated for different numbers of steps
        between the notes in an octave. The predefined equal temperament
        defines 12 steps per octave, which is perhaps the most common
        tuning system in modern Western music. But any number of steps can
        be used.

        Parameters
        ----------
        number_of_steps : int
            The number of equal steps into which to divide an octave.
        """

    def generate_custom(self, intervals, ratios, name="custom"):
        """
        A custom temperament can be defined with arbitrary rules.

        Parameters
        ----------
        intervals : list
            An ordered list of interval names to define per octave

        ratios : dict
            A dictionary of ratios to apply when generating the note
            frequencies in an octave. The dictionary keys are defined
            in the intervals list. Each ratio (between 1 and 2) is applied
            to the base frequency of the octave. The final frequency
            should always be equal to 2.

        name : str
            The name associated with the custom temperament
        """
```

By default, the Temperament object creates an equal temperament based
on 2^^(1/12), with a starting frequency of C0 == 16.3516 Hz. 9 octaves
of 12 semitones are generated. Many other predefined temperaments are
available and equal temperament can also be generated for other powers
of 2. For example, 2^^(1/24) would produce quarter steps. Also, the
temperament can be tuned to a different base pitch.

The built-in temperaments are:

* `"equal"`
* `"just intonation"`
* `"pythagorean"`
* `"third comma meantone"`
* `"quarter comma meantone"`

```python
    t = Temperament(name="equal")
```

To tune to a different base frequency:

```python
    t.tune("a", 4, 441)
```

A generic name is defined for each note in the octave.  The convention
is n0, n1, etc. These notes can be used by the
get_freq_by_generic_note_name_and_octave method to retrieve a
frequency by note name and octave.

```python
    freq = t.get_freq_by_generic_note_name_and_octave("n7", 4)
```

You may need to know the number of semitones in an octave and
the number of notes in the temperament.

```python
    number_of_semitones = t.get_number_of_semitones_in_octave()
    number_of_notes = t.get_number_of_notes_in_temperament()
```

And the note name from an index...

```python
   generic_name = t.get_note_name(semitone_index)
```

You can get the pitch number from a frequency and a frequency from
an index

```python
   pitch_number = t.get_nearest_freq_index(freq)
   freq = t.get_freq_by_index(pitch_number)
```

Key Signature
-------------

```python
class KeySignature:

    MUSICAL_MODES = {
        # 12 notes in an octave
        "chromatic": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        # 8 notes in an octave
        "algerian": [2, 1, 2, 1, 1, 1, 3, 1],
        "diminished": [2, 1, 2, 1, 2, 1, 2, 1],
        "spanish": [1, 2, 1, 1, 1, 2, 2, 2],
        "octatonic": [1, 2, 1, 2, 1, 2, 1, 2],
        "bebop": [1, 1, 1, 2, 2, 1, 2, 2],
        # 7 notes in an octave
        "major": [2, 2, 1, 2, 2, 2, 1],
        "harmonic major": [2, 2, 1, 2, 1, 3, 1],
        "minor": [2, 1, 2, 2, 1, 2, 2],
        "natural minor": [2, 1, 2, 2, 1, 2, 2],
        "harmonic minor": [2, 1, 2, 2, 1, 3, 1],
        "melodic minor": [2, 1, 2, 2, 2, 2, 1],
        # "Church" modes
        "ionian": [2, 2, 1, 2, 2, 2, 1],
        "dorian": [2, 1, 2, 2, 2, 1, 2],
        "phrygian": [1, 2, 2, 2, 1, 2, 2],
        "lydian": [2, 2, 2, 1, 2, 2, 1],
        "mixolydian": [2, 2, 1, 2, 2, 1, 2],
        "aeolian": [2, 1, 2, 2, 1, 2, 2],
        "locrian": [1, 2, 2, 1, 2, 2, 2],
        "jazz minor": [2, 1, 2, 2, 2, 2, 1],
        "arabic": [2, 2, 1, 1, 2, 2, 2],
        "byzantine": [1, 3, 1, 2, 1, 3, 1],
        "enigmatic": [1, 3, 2, 2, 2, 1, 1],
        "ethiopian": [2, 1, 2, 2, 1, 2, 2],
        "geez": [2, 1, 2, 2, 1, 2, 2],
        "hindu": [2, 2, 1, 2, 1, 2, 2],
        "hungarian": [2, 1, 3, 1, 1, 3, 1],
        "maqam": [1, 3, 1, 2, 1, 3, 1],
        "romanian minor": [2, 1, 3, 1, 2, 1, 2],
        "spanish gypsy": [1, 3, 1, 2, 1, 2, 2],
        # 6 notes in an octave
        "minor blues": [3, 2, 1, 1, 3, 2],
        "major blues": [2, 1, 1, 3, 2, 2],
        "whole tone": [2, 2, 2, 2, 2, 2],
        # 5 notes in an octave
        "major pentatonic": [2, 2, 3, 2, 3],
        "minor pentatonic": [3, 2, 2, 3, 2],
        "chinese": [4, 2, 1, 4, 1],
        "egyptian": [2, 3, 2, 3, 2],
        "hirajoshi": [1, 4, 1, 4, 2],
        "in": [1, 4, 2, 1, 4],
        "minyo": [3, 2, 2, 3, 2],
        "fibonacci": [1, 1, 2, 3, 5],
    }

    # These maqam mode names imply a specific key.
    MAQAM_KEY_OVERRIDES = {
        "hijaz kar": "c",
        "hijaz kar maqam": "c",
        "shahnaz": "d",
        "maqam mustar": "eb",
        "maqam jiharkah": "f",
        "shadd araban": "g",
        "suzidil": "a",
        "ajam": "bb",
        "ajam maqam": "bb",
    }

    """
    A key signature is a set of sharp, flat, and natural symbols.
    """

    def __init__(self, mode="major", key="c", number_of_semitones=12):
        """
        In defining a scale, we need to know the key, the mode, and the
        number of notes in the temperament used to define the scale.

        Parameters
        ----------
        mode : str
            One of the modes defined in self.MUSIC_MODES

        key : str
            Any pitch defined by in the temperament. (Note that currently
            the only notation supported is for temperaments with up to 12
            steps.

        number_of_semitones : int
            The number of semitones defined in the temperament
        """

    def set_fixed_solfege(self, state=False):
        """
        Fixed Solfege means that the mapping between Solfege and
        letter names is fixed: do == c, re == d, ...

        Moveable (not fixed) Solfege means that do == the first note
        in the scale, etc.

        Parameters
        ----------
        state : boolean
            State to set FIxed Solfege: True or False
        """

    def get_fixed_solfege(self):
        """
        Returns the Fixed Solfege state

        Returns
        -------
        boolean
            State of fixed Solfege
        """

    def get_scale(self):
        """
        The scale defined by the key signature.

        Returns
        -------
        obj
            The scale object
        """

    def get_notes_in_scale(self):
        """
        The (scalar) notes in the scale.

        Returns
        -------
        list
            The (scalar) notes in the scale.

        NOTE: The internal definition of the notes in a scale includes
        the octave.
        """

    def get_mode_length(self):
        """
        How many notes are in the scale?

        Returns
        -------
        int
            The number of (scalar) notes in the scale.
        """

    def get_number_of_semitones(self):
        """
        How many semitones (half-steps) are in the temperament used to
        define this key/mode?

        Returns
        -------
        int
            The number of semitones in the temperament used to define
            the scale
        """
```

Key Signatures are defined by a key and a mode, e.g. `C Major`. This is used
to define which semitones (half steps) in an octave are in the scale.

```python
    ks = KeySignature(mode="major", key="c")
```

By default, the Key Signature object assumes that there are 12
semitones per octave, but this can be overriden for temperaments with
other configurations, e.g. the meantone temperaments.

```python
    ks = KeySignature(mode="major", key="c", number_of_semitones=12)
```

Within each Key Signature object is a Scale object, which is defined
by the key and mode at the time of instanciation.

```python
    scale = ks.get_scale()
```

Fixed Solfege means that the mapping between Solfege and letter names
is fixed: do == c, re == d, ...

Moveable (not fixed) Solfege means that do == the first note in the
scale, etc.

```python
    ks = KeySignature(key="g", mode="major")
    s = ks.get_scale()
    generic_name = s.convert_to_generic_note_name("sol")[0]  # "n7"
    ks.set_fixed_solfege(False)  # Moveable
    generic_name = s.convert_to_generic_note_name("do")[0]  # "n7"
```

Scale
-----

```python
class Scale:
    """
    A scale is a selection of notes in an octave.
    """

    def __init__(
        self,
        half_steps_pattern=None,
        starting_index=0,
        number_of_semitones=12,
        prefer_sharps=True,
    ):
        """
        When defining a scale, we need the half steps pattern that defines
        the selection anf a starting note, e.g., C or F#,

        Parameters
        ----------
        half_steps_pattern : list
            A list of int values that define how many half steps to take
            between each note in the scale, e.g., [2, 2, 1, 2, 2, 2, 1]
            defines the steps for a Major scale

        starting_index : int
            An index into the half steps defining an octave that determines
            from where to start building the scale, e.g., 0 for C and 7 for G
            in a 12-step temperament

        number_of_semitones : int
            If the half_steps_pattern is an empty list, then use the number
            of semitones instead. (Or trigger a mapping from 12 to 21.)

        prefer_sharps : boolean
            If we are mapping from 12 to 21 semitones, we need to know
            whether or not to prefer sharps or flats.
        """

    def get_number_of_semitones(self):
        """
        The number of semitones is the number of notes in the temperament.

        Returns
        -------
        int
            The number of notes in the scale
        """

    def get_note_names(self):
        """
        The notes defined by the temperament are used to build the scale.

        Returns
        -------
        list
            The notes defined by the temperament
        """

    def get_scale(self, pitch_format=None):
        """
        The notes in the scale are a subset of the notes defined by the
        temperament.

        Returns
        -------
        list
            The notes in the scale
        """

    def get_scale_and_octave_deltas(self, pitch_format=None):
        """
        The notes in the scale are a subset of the notes defined by the
        temperament.

        Returns
        -------
        list
            The notes in the scale
        list
        The octave deltas (either 0 or 1) are used to mark notes above
        B#, which would be in the next octave, e.g., G3, A3, B3, C4...
        """

    def normalize_scale(self, scale):
        """
        Normalize the scale by converting double sharps and double flats.

        Parameters
        ----------
        scale : list
            The notes in a scale

        Returns
        -------
        list
            The same scale where the notes have been converted to just
            sharps, flats, and naturals
        """

    def set_custom_note_names(self, custom_names):
        """
        Custom note names defined by user

        Parameters
        ----------
        custom_names : list
            A list of custom names

        Note: Names should not end with b or x or they will cause
        collisions with the flat (b) and doublesharp (x) accidentals.
        """

    def get_custom_note_names(self):
        """
        Custom note names defined by user

        Returns
        -------
        list
            Custom names
        """

    def pitch_name_type(self, pitch_name):
        """
        Check pitch type, including test for custom names

        Parameters
        ----------
        pitch_name : str
            pitch name to test

        Returns
        -------
        str
            pitch type, e.g., LETTER_NAME, SOLFEGE_NAME, etc.
        """

    def convert_to_generic_note_name(self, pitch_name):
        """
        Convert from a letter name used by 12-semitone temperaments to
        a generic note name as defined by the temperament.
        NOTE: Only for temperaments with 12 semitones.
        """

    def generic_note_name_convert_to_type(self, pitch_name, target_type, prefer_sharps=True):
        """
        Given a generic note name, convert it to a pitch name type.

        Parameters
        ----------
        pitch_name : str
            Source generic note name

        target_type : str
            One of the predefined types, e.g., LETTER_NAME, SOLFEGE_NAME, etc.

        prefer_sharps : boolean
            If there is a choice, should we use a sharp or a flat?

        Returns
        -------
        str
            Converted note name
        """

    def modal_pitch_to_letter(self, modal_index):
        """
        Given a modal number, return the corresponding pitch in the scale
        (and any change in octave).

        Parameters
        ----------
        modal_index : int
            The modal index specifies an index into the scale. If the
            index is >= mode length or < 0, a relative change in octave
            is also calculated.

        Returns
        -------
        str
            The pitch that is the result of indexing the scale by the
            modal index.

        int
            The relative change in octave due to mapping the modal index
            to the mode length
        """

    def note_in_scale(self, target):
        """
        Given a pitch, check to see if it is in the scale.

        Parameters
        ----------
        target : str
            The target pitch specified as a pitch letter, e.g., c#, fb.

        Returns
        -------
        boolean
            True if the note is in the scale
        """

    def semitone_transform(self, starting_pitch, number_of_half_steps):
        """
        Given a starting pitch, add a semitone transform and return
        the resultant pitch (and any change in octave).

        Parameters
        ----------
        starting_pitch : str
            The starting pitch specified as a pitch letter, e.g., c#, fb.

        number_of_half_steps : int
            Half steps are steps in the notes defined by the temperament

        Returns
        -------
        str
            The pitch that is the number of half steps from the starting
            pitch.

        int
            The relative change in octave between the starting pitch and the
            new pitch.

        int
            error code
        """

    def scalar_transform(self, starting_pitch, number_of_scalar_steps):
        """
        Given a starting pitch, add a scalar transform and return
        the resultant pitch (and any change in octave).

        Parameters
        ----------
        starting_pitch : str
            The starting pitch specified as a pitch letter, e.g., c#, fb.
            Note that the starting pitch may or may not be in the scale.

        number_of_scalar_steps : int
            Scalar steps are steps in the scale (as opposed to half-steps)

        Returns
        -------
        str
            The pitch that is the number of scalar steps from the starting
            pitch.

        int
            The relative change in octave between the starting pitch and the
            new pitch.

        int
            error code
        """

    def semitone_distance(self, pitch_a, octave_a, pitch_b, octave_b):
        """
        Calcualte the distance between two notes in semitone steps

        Parameters
        ----------
        pitch_a : str
            Pitch name one of two
        octave_a : int
            Octave number one of two
        pitch_b : str
            Pitch name two of two
        octave_b : int
            Octave number two of two

        Returns
        -------
        int
            Distance calculated in semitone steps
        """

    def scalar_distance(self, pitch_a, octave_a, pitch_b, octave_b):
        """
        Calcualte the distance between two notes in scalar steps

        Parameters
        ----------
        pitch_a : str
            Pitch name one of two
        octave_a : int
            Octave number one of two
        pitch_b : str
            Pitch name two of two
        octave_b : int
            Octave number two of two

        Returns
        -------
        int
            Distance calculated in scalar steps
        int
            Any semitone rounding error in the calculation
        """

    def invert(self, pitch_name, octave, invert_point_pitch, invert_point_octave, invert_mode):
        """
        Invert will rotate a series of notes around an invert point.
        There are three different invert modes: even, odd, and
        scalar. In even and odd modes, the rotation is based on half
        steps. In even and scalar mode, the point of rotation is the
        given note. In odd mode, the point of rotation is shifted up
        by a 1/4 step, enabling rotation around a point between two
        notes. In "scalar" mode, the scalar interval is preserved
        around the point of rotation.

        Parameters
        ----------
        pitch_name : str
            The pitch name of the note to be rotated
        octave : int
            The octave of the note to be rotated
        invert_point_name : str
            The pitch name of the axis of inversion
        invert_point_octave : int
            The octave of the axis of inversion

        Returns
        -------
        str
            Pitch name of the inverted note
        int
            Octave of the inverted note
        """

    def closest_note(self, target):
        """
        Given a target pitch, what is the closest note in the current
        key signature (key and mode)?

        Parameters
        ----------
        target : str
            target pitch specified as a pitch letter, e.g., c#, fb

        Returns
        -------
        str
            The closest pitch to the target pitch in the scale.
        int
            The scalar index value of the closest pitch in the scale
            (If the target is midway between two scalar pitches, the
            lower pitch is returned.)
        int
            The distance in semitones (half steps) from the target
            pitch to the scalar pitch (If the target is higher than
            the scalar pitch, then distance > 0. If the target is
            lower than the scalar pitch then distance < 0. If the
            target matches a scale pitch, then distance = 0.)
        int
            error code (0 means success)
        """
```

The Scale object holds the list of notes defined in the scale defined
by a key and mode. While it is unlikely you'll need to access this
object directly, there are public methods available for accessing the
notes in a scale as an array, the number of notes in the scale, and
the octave offsets associated with a scale (new octaves always start
at C regardless of the temperament, key, or mode.

Ths Scale object supports a variety of naming schemes, including the
generic note names used by the Temperament object, letter names, both
fixed and moveable Solfege, East Indian Solfege, scale degree, and
custom defined names (The pitch name types are defined in
musicutils.py).

```python
    s.set_custom_note_names(
        ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
    )

    generic_name = s.convert_to_generic_note_name("g")
    generic_name = s.convert_to_generic_note_name("sol")
    generic_name = s.convert_to_generic_note_name("5")
    generic_name = s.convert_to_generic_note_name("pa")
    generic_name = s.convert_to_generic_note_name("golf")

    letter_name = s.generic_note_name_convert_to_type("n7", LETTER_NAME)  # "g"
    solfege_name = s.generic_note_name_convert_to_type("n7", SOLFEGE_NAME)  # "sol"
    ei_solfege_name = s.generic_note_name_convert_to_type("n7", EAST_INDIAN_SOLFEGE_NAME)  # "pa"
    custom_name = s.generic_note_name_convert_to_type("n7", CUSTOM_NAME)  # "golf"
    scalar_mode_number = s.generic_note_name_convert_to_type("n7", SCALAR_MODE_NUMBER)  # "5"
```

The Scale obj is used to navigate the scale, either by scalar or
semitone steps.

```python
    generic_name, delta_octave, error = s.semitone_transform(
        generic_name, number_of_half_steps
    )
    generic_name, delta_octave, error = s.scalar_transform(
        generic_name, number_of_scalar_steps
    )
```

Music Utils
-----------

```python
# Pitch name types
GENERIC_NOTE_NAME = "generic note name"
LETTER_NAME = "letter name"
SOLFEGE_NAME = "solfege name"
EAST_INDIAN_SOLFEGE_NAME = "east indian solfege name"
SCALAR_MODE_NUMBER = "scalar mode number"
CUSTOM_NAME = "custom name"
UNKNOWN_PITCH_NAME = "unknown"


def strip_accidental(pitch):
    """
    Remove an accidental and return the number of half steps that
    would have resulted from its application to the pitch

    Parameters
    ----------
    pitch : str
        Upper or lowecase pitch name with accidentals as ASCII or Unicode

    Returns
    -------
    str
        Normalized pitch name
    int
        Change in half steps represented by the removed accidental
    """


def normalize_pitch(pitch):
    """
    Internally, we use a standardize form for our pitch letter names:
    * Lowercase c, d, e, f, g, a, b for letter names;
    * #, b, x, and bb for sharp, flat, double sharp, and double flat for
      accidentals.

    Note names for temperaments with more than 12 semitones are of the
    form: n0, n1, ...

    Parameters
    ----------
    pitch : str
        Upper or lowecase pitch name with accidentals as ASCII or Unicode

    Returns
    -------
    str
        Normalized pitch name
    """


def display_pitch(pitch):
    """
    The internal pitch name is converted to unicode, e.g., cb --> C♭

    Parameters
    ----------
    pitch : str
        Upper or lowecase pitch name with accidentals as ASCII or Unicode

    Returns
    -------
    str
        Pretty pitch name
    """


def is_a_sharp(pitch_name):
    """
    Is the pitch a sharp or not flat?

    Parameters
    ----------
    pitch_name : str
        The pitch name to test

    Returns
    -------
    boolean
        Result of the test
    """


def find_sharp_index(pitch_name):
    """
    Return the index value of the pitch name

    Parameters
    ----------
    pitch_name : str
        The pitch name to test

    Returns
    -------
    int
        Index into the chromatic scale with sharp notes
    """


def is_a_flat(pitch_name):
    """
    Is the pitch a flat or not sharp?

    Parameters
    ----------
    pitch_name : str
        The pitch name to test

    Returns
    -------
    boolean
        Result of the test
    """


def find_flat_index(pitch_name):
    """
    Return the index value of the pitch name

    Parameters
    ----------
    pitch_name : str
        The pitch name to test

    Returns
    -------
    int
        Index into the chromatic scale with sharp notes
    """


def get_pitch_type(pitch_name):
    """
    Pitches can be specified as a letter name, a solfege name, etc.
    """
```

EXAMPLE
-------

Putting it all together...

```python
from temperament import Temperament
from keysignature import KeySignature
from currentpitch import CurrentPitch

# Use the default tuning (Equal temperament) and the default key and
# mode (C Major).
cp = CurrentPitch()
print(cp.get_freq())

# Use Pythagorean tuning and G Major.
t = Temperament(name="pythagorean")
ks = KeySignature(mode="major", key="g")
cp = CurrentPitch(keysignature=ks, temperament=t)
print(cp.get_freq())

# Walk through the scale.
mode_length = ks.get_mode_length()
print(cp.get_freq())
for i in range(mode_length):
    cp.apply_scalar_transposition(1)
    print(cp.get_freq())

# Set the current pitch to G4.
cp.set_pitch("g", 4)
print(cp)
```

The default settings are Equal temperament, C Major, and G4. This
results in a frequency of `391.9954879721078`.

Switching to Pythagorean tuning results in G4 mapping to
`403.21972995787394`.

The frequencies in G Major (Octave 4) are:

```python
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
