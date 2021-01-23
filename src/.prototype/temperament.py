# -*- coding: utf-8 -*-
"""
Temperament defines the relationships between notes.
"""

# Copyright (c) 2020, 2021 Walter Bender, Sugar Labs
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the The GNU Affero General Public
# License as published by the Free Software Foundation; either
# version 3 of the License, or (at your option) any later version.
#
# You should have received a copy of the GNU Affero General Public
# License along with this library; if not, write to the Free Software
# Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

import math

from musicutils import normalize_pitch, CHROMATIC_NOTES_SHARP, CHROMATIC_NOTES_FLAT


class Temperament:
    """
    In musical tuning, temperament is a tuning system that defines the
    notes (semitones) in an octave. Most modern Western musical
    instruments are tuned in the equal temperament system based on the
    1/12 root of 2 (12 semitones per octave). Many traditional
    temperaments are based on ratios.
    """

    # The intervals define which ratios are used to define the notes
    # within a given temperament.
    default_intervals = [
        "perfect 1",
        "minor 2",
        "major 2",
        "minor 3",
        "major 3",
        "perfect 4",
        "diminished 5",
        "perfect 5",
        "minor 6",
        "major 6",
        "minor 7",
        "major 7",
        "perfect 8",
    ]

    twelve_tone_equal_ratios = {
        "perfect 1": 1,
        "minor 2": math.pow(2, 1 / 12),
        "augmented 1": math.pow(2, 1 / 12),
        "major 2": math.pow(2, 2 / 12),
        "augmented 2": math.pow(2, 3 / 12),
        "minor 3": math.pow(2, 3 / 12),
        "major 3": math.pow(2, 4 / 12),
        "augmented 3": math.pow(2, 5 / 12),
        "diminished 4": math.pow(2, 4 / 12),
        "perfect 4": math.pow(2, 5 / 12),
        "augmented 4": math.pow(2, 6 / 12),
        "diminished 5": math.pow(2, 6 / 12),
        "perfect 5": math.pow(2, 7 / 12),
        "augmented 5": math.pow(2, 8 / 12),
        "minor 6": math.pow(2, 8 / 12),
        "major 6": math.pow(2, 9 / 12),
        "augmented 6": math.pow(2, 10 / 12),
        "minor 7": math.pow(2, 10 / 12),
        "major 7": math.pow(2, 11 / 12),
        "augmented 7": math.pow(2, 12 / 12),
        "diminished 8": math.pow(2, 11 / 12),
        "perfect 8": 2,
    }

    just_intonation_ratios = {
        "perfect 1": 1,
        "minor 2": 16 / 15,
        "augmented 1": 16 / 15,
        "major 2": 9 / 8,
        "augmented 2": 6 / 5,
        "minor 3": 6 / 5,
        "major 3": 5 / 4,
        "augmented 3": 4 / 3,
        "diminished 4": 5 / 4,
        "perfect 4": 4 / 3,
        "augmented 4": 7 / 5,
        "diminished 5": 7 / 5,
        "perfect 5": 3 / 2,
        "augmented 5": 8 / 5,
        "minor 6": 8 / 5,
        "major 6": 5 / 3,
        "augmented 6": 16 / 9,
        "minor 7": 16 / 9,
        "major 7": 15 / 8,
        "augmented 7": 2 / 1,
        "diminished 8": 15 / 8,
        "perfect 8": 2,
    }

    pythagorean_ratios = {
        "perfect 1": 1,
        "minor 2": 256 / 243,
        "augmented 1": 256 / 243,
        "major 2": 9 / 8,
        "augmented 2": 32 / 27,
        "minor 3": 32 / 27,
        "major 3": 81 / 64,
        "augmented 3": 4 / 3,
        "diminished 4": 81 / 64,
        "perfect 4": 4 / 3,
        "augmented 4": 729 / 512,
        "diminished 5": 729 / 512,
        "perfect 5": 3 / 2,
        "augmented 5": 128 / 81,
        "minor 6": 128 / 81,
        "major 6": 27 / 16,
        "augmented 6": 16 / 9,
        "minor 7": 16 / 9,
        "major 7": 243 / 128,
        "augmented 7": 2 / 1,
        "diminished 8": 243 / 128,
        "perfect 8": 2,
    }

    third_comma_meantone_ratios = {
        "perfect 1": 1,
        "minor 2": 1.075693,
        "augmented 1": 1.037156,
        "major 2": 1.115656,
        "augmented 2": 1.157109,
        "minor 3": 1.200103,
        "major 3": 1.244694,
        "augmented 3": 1.290943,
        "diminished 4": 1.290943,
        "perfect 4": 1.338902,
        "augmented 4": 1.38865,
        "diminished 5": 1.440247,
        "perfect 5": 1.493762,
        "augmented 5": 1.549255,
        "minor 6": 1.60682,
        "major 6": 1.666524,
        "augmented 6": 1.728445,
        "minor 7": 1.792668,
        "major 7": 1.859266,
        "augmented 7": 1.92835,
        "diminished 8": 1.92835,
        "perfect 8": 2,
    }

    third_comma_meantone_intervals = [
        "perfect 1",
        "augmented 1",
        "minor 2",
        "major 2",
        "augmented 2",
        "minor 3",
        "major 3",
        "diminished 4",
        "perfect 4",
        "augmented 4",
        "diminished 5",
        "perfect 5",
        "augmented 5",
        "minor 6",
        "major 6",
        "augmented 6",
        "minor 7",
        "major 7",
        "diminished 8",
        "perfect 8",
    ]

    quarter_comma_meantone_ratios = {
        "perfect 1": 1,
        "minor 2": 16 / 15,
        "augmented 1": 25 / 24,
        "major 2": 9 / 8,
        "augmented 2": 75 / 64,
        "minor 3": 6 / 5,
        "major 3": 5 / 4,
        "diminished 4": 32 / 25,
        "augmented 3": 125 / 96,
        "perfect 4": 4 / 3,
        "augmented 4": 25 / 18,
        "diminished 5": 36 / 25,
        "perfect 5": 3 / 2,
        "augmented 5": 25 / 16,
        "minor 6": 8 / 5,
        "major 6": 5 / 3,
        "augmented 6": 125 / 72,
        "minor 7": 9 / 5,
        "major 7": 15 / 8,
        "diminished 8": 48 / 25,
        "augmented 7": 125 / 64,
        "perfect 8": 2,
    }

    quarter_comma_meantone_intervals = [
        "perfect 1",
        "augmented 1",
        "minor 2",
        "major 2",
        "augmented 2",
        "minor 3",
        "major 3",
        "diminished 4",
        "augmented 3",
        "perfect 4",
        "augmented 4",
        "diminished 5",
        "perfect 5",
        "augmented 5",
        "minor 6",
        "major 6",
        "augmented 6",
        "minor 7",
        "major 7",
        "diminished 8",
        "augmented 7",
        "perfect 8",
    ]

    freqs = []  # Each temperament contains a list of notes in hertz.
    generic_note_names = []  # An array of names for each note in an octave
    C0 = 16.3516  # By default, we use C in Octave 0 as our base frequency.

    def __init__(self, name="equal"):
        """
        Initialize the class. A temperament will be generated but it can
        subsequently be overriden.

        Parameters
        ----------

        name : str
            The name of a temperament, e.g., "equal", "just intonation". etc.
        """
        self.name = name
        self.octave_length = 12  # in semitones
        self.base_frequency = self.C0
        self.number_of_octaves = 8
        self.ratios = None
        self.intervals = None
        self.generate(self.name)

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
        pitch_name = normalize_pitch(pitch_name)
        if pitch_name in CHROMATIC_NOTES_SHARP:
            i = CHROMATIC_NOTES_SHARP.index(pitch_name)
        elif pitch_name in CHROMATIC_NOTES_FLAT:
            i = CHROMATIC_NOTES_FLAT.index(pitch_name)
        else:
            print("pitch %s not found." % pitch_name)
            return

        if self.ratios is not None and self.intervals is not None:
            self.base_frequency = (frequency / 2 ** octave) / self.ratios[
                self.intervals[i]
            ]
            self.generate(self.name)
        return

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
        self.base_frequency = base_frequency

    def get_base_frequency(self):
        """
        Returns
        -------
        float
            The base frequency (in Hertz) used to seed the calculations
        """
        return self.base_frequency

    def set_number_of_octaves(self, number_of_octaves=8):
        """
        How many octaves are defined for the temperament?

        Parameters
        ----------
        number_of_octaves : int
            The number of octaves in the temperament. (8 octaves in
            equal temperament would span 96 notes).
        """
        self.number_of_octaves = min(1, int(abs(number_of_octaves)))

    def get_number_of_octaves(self):
        """
        Returns
        -------
        int
            The number of octaves in the temperament.
        """
        return self.number_of_octaves

    def get_name(self):
        """
        Returns
        -------
        str
            The name of the temperament
        """
        return self.name

    def get_freqs(self):
        """
        freqs is the list of all of the frequencies in the temperament.

        Returns
        -------
        list
            A list of frequencies in Hertz (float)
        """
        return self.freqs

    def get_note_names(self):
        """
        Generic note names are assigned to define a chromatic scale.

        Returns
        -------
        list
            A list of note names (str)
        """
        return self.generic_note_names

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
        return self.generic_note_names[semitone_index]

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
        return self.generic_note_names.index(note_name)

    def get_freq_by_index(self, pitch_index):
        """
        Parameters
        ----------
        pitch_index : int
            The index into the frequency list

        Returns
        -------
        float
            Returns the frequency (in Hertz) of a note by index
        """
        if len(self.freqs) == 0:
            return 0
        if pitch_index < 0:
            pitch_index = 0
        if pitch_index > len(self.freqs) - 1:
            pitch_index = len(self.freqs) - 1
        return self.freqs[int(pitch_index)]

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
        if len(self.freqs) == 0:
            return 0
        i = (int(octave) * self.octave_length) + modal_index
        if i < 0:
            return self.freqs[0]
        if i > len(self.freqs) - 1:
            return self.freqs[-1]
        return self.freqs[int(i)]

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
        if len(self.freqs) == 0:
            return 0
        if note_name not in self.generic_note_names:
            print("Note %s not found in generic note names." % (note_name))
            return 0
        ni = self.generic_note_names.index(note_name)
        i = (octave * self.octave_length) + ni
        if i < 0:
            return self.freqs[0]
        if i > len(self.freqs) - 1:
            return self.freqs[-1]
        return self.freqs[int(i)]

    def get_number_of_semitones_in_octave(self):
        """
        Returns
        -------
        int
            The number of notes defined per octave
        """
        return self.octave_length

    def generate_generic_note_names(self):
        """
        A generic name is defined for each note in the octave.
        The convention is n0, n1, etc. These notes can be used by
        the get_freq_by_generic_note_name_and_octave method to retrieve
        a frequency by note name and octave.
        """
        self.generic_note_names = []
        for i in range(self.octave_length):
            self.generic_note_names.append("n%d" % i)

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
        self.name = name.lower()

        if self.name == "third comma meantone":
            intervals = self.third_comma_meantone_intervals[:]
            ratios = self.third_comma_meantone_ratios
        elif self.name == "quarter comma meantone":
            intervals = self.quarter_comma_meantone_intervals[:]
            ratios = self.quarter_comma_meantone_ratios
        else:
            intervals = self.default_intervals[:]
            if self.name == "equal":
                ratios = self.twelve_tone_equal_ratios
            elif self.name == "just intonation":
                ratios = self.just_intonation_ratios
            elif self.name == "pythagorean":
                ratios = self.pythagorean_ratios
            else:
                print("Unknown temperament %d; using equal temperament" % (name))
                ratios = self.twelve_tone_equal_ratios

        self.ratios = ratios
        self.intervals = intervals
        self.octave_length = len(intervals) - 1
        self.freqs = [self.base_frequency]

        for octave in range(self.number_of_octaves):
            c = self.freqs[-1]
            for i in range(self.octave_length):
                if i == 0:
                    continue
                self.freqs.append(c * ratios[intervals[i]])

        self.generate_generic_note_names()

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
        nsteps = int(number_of_steps)
        if nsteps < 1:
            nsteps = 1

        self.name = "name_%d" % nsteps

        self.octave_length = nsteps
        self.freqs = [self.base_frequency]

        # nth root of 2
        root = 2 ** (1 / nsteps)
        for octave in range(self.number_of_octaves):
            for i in range(self.octave_length):
                if i == 0:
                    continue
                self.freqs.append(self.freqs[-1] * root)

        self.generate_generic_note_names()

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
        self.name = name

        self.octave_length = len(intervals)
        self.freqs = [self.base_frequency]

        for octave in range(self.number_of_octaves):
            c = self.freqs[-1]
            for i in range(self.octave_length):
                if i == 0:
                    continue
                self.freqs.append(c * ratios[intervals[i]])

        self.generate_generic_note_names()

    def __str__(self):
        """
        Returns
        -------
        str
            The list of frequencies
        """
        freqs = []
        for f in self.freqs:
            freqs.append("%0.2f" % (f + 0.005))
        return "%s temperament:\n\n%s" % (self.name, "\n".join(freqs))
