Music Utilities
===============

As part of the refactoring of Music Blocks, we are doing an overhaul
to the utilties that support temperament and key signature. We further
encapsulate most of the complexity of tuning, key, mode, and scale, as
well as transpositions and intervals in a "current pitch" object.

```
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

```
cp = CurrentPitch()
```

There are three ways to change the current pitch:
* assigning a new pitch explicitly
* modifying the current pitch through a semitone transposition
* modifying the current pitch through a scalar transposition

```
cp.set_pitch("g", 4)

cp.set_pitch("sol", 4)

cp.set_pitch("n7", 4)

cp.set_pitch(7, 4)

cp.set_pitch(392.0)
```

```
cp.apply_semitone_transposition(2)

cp.apply_semitone_transposition(-12)
```

```
cp.apply_scalar_transposition(1)

cp.apply_scalar_transposition(-8)
```

There are several ways to access the current pitch:
* getting the frequency in Hertz, e.g., 392.0
* getting the "generic" note name, e.g., n7
* getting the current octave, e.g., 4
* getting the pitch number, e.g., 55
* getting the semitone index, e.g., 7

```
freq = cp.get_freq()
```

And you can calculate a frequency based on an interval starting from
the current pitch, defined in semitone or scalar steps.

```
freq = cp.get_semitone_interval(4)

freq = cp.get_scalar_interval(2)
```
