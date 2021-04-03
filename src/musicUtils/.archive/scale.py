# -*- coding: utf-8 -*-
"""
The Scale class defines an object that manages the notes in a scale
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


class Scale:
    """
    A scale is a selection of notes in an octave.
    """

    TWELVE2TWENTYONE = {
        "n0": ["n0", "n0"],  # c
        "n1": ["n1", "n2"],  # c#, db
        "n2": ["n3", "n3"],  # d
        "n3": ["n4", "n5"],  # d# eb
        "n4": ["n6", "n6"],  # e
        "n5": ["n9", "n9"],  # f
        "n6": ["n10", "n11"],  # f#, gb
        "n7": ["n12", "n12"],  # g
        "n8": ["n13", "n14"],  # g#, ab
        "n9": ["n15", "n15"],  # a
        "n10": ["n16", "n17"],  # a#, bb
        "n11": ["n18", "n18"],  # b
    }

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

        # Calculate the number of semitones by summing up the half
        # steps.
        if half_steps_pattern is None:
            self.number_of_semitones = number_of_semitones
            half_steps_pattern = []
            for i in range(self.number_of_semitones):
                half_steps_pattern.append(1)
        else:
            self.number_of_semitones = 0
            for step in half_steps_pattern:
                self.number_of_semitones += step

        # Define generic note names that map to temperament.
        self.note_names = []
        for i in range(self.number_of_semitones):
            self.note_names.append("n%d" % i)

        i = starting_index % len(self.note_names)
        octave = 0
        self.scale = [self.note_names[i]]
        self.octave_deltas = [octave]
        for step in half_steps_pattern:
            i += step
            if not i < self.number_of_semitones:
                octave += 1
                i -= self.number_of_semitones
            self.scale.append(self.note_names[i])
            self.octave_deltas.append(octave)

        # We defined the number of semitones based on the half
        # steps pattern but we may want to map from a 12 step
        # scale to anotther scale, e.g. 21 step scale.
        if (
            self.number_of_semitones != number_of_semitones
            and number_of_semitones == 21
        ):
            if prefer_sharps:
                j = 0
            else:
                j = 1
            for i, note in enumerate(self.scale):
                self.scale[i] = self.TWELVE2TWENTYONE[note][j]
            # And regenerate the semitone scale
            self.number_of_semitones = number_of_semitones
            self.note_names = []
            for i in range(self.number_of_semitones):
                self.note_names.append("n%d" % i)

    def get_number_of_semitones(self):
        """
        The number of semitones is the number of notes in the temperament.

        Returns
        -------
        int
            The number of notes in the scale
        """
        return len(self.note_names)

    def get_note_names(self):
        """
        The notes defined by the temperament are used to build the scale.

        Returns
        -------
        list
            The notes defined by the temperament
        """
        return self.note_names

    def get_scale(self, pitch_format=None):
        """
        The notes in the scale are a subset of the notes defined by the
        temperament.

        Returns
        -------
        list
            The notes in the scale
        """
        if pitch_format is None:
            return self.scale
        if len(pitch_format) == self.number_of_semitones:
            scale = []
            for i in range(len(self.scale)):
                scale.append(pitch_format[self.note_names.index(self.scale[i])])
            return scale
        print("format does not match number of semitones")
        return self.scale

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
        return self.get_scale(pitch_format), self.octave_deltas
