# -*- coding: utf-8 -*-
"""
The Current Pitch class defines an object that manages pitch state.
"""

# Copyright (c) 2021 Walter Bender, Sugar Labs
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the The GNU Affero General Public
# License as published by the Free Software Foundation; either
# version 3 of the License, or (at your option) any later version.
#
# You should have received a copy of the GNU Affero General Public
# License along with this library; if not, write to the Free Software
# Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA


from temperament import Temperament
from keysignature import KeySignature


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
        if temperament is None:
            self._t = Temperament()
        else:
            self._t = temperament

        if keysignature is None:
            self._ks = KeySignature(
                number_of_semitones=self._t.get_number_of_semitones_in_octave()
            )
        else:
            self._ks = keysignature
        self._s = self._ks.get_scale()

        self._semitone_index = i
        self._octave = octave

        self._generic_name = self._t.get_note_name(self._semitone_index)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )

        # What is the absolute pitch number?
        self._number = (
            self._octave * self._t.get_number_of_semitones_in_octave()
            + self._semitone_index
        )

    def _define_by_frequency(self, freq):
        # Assume it is a frequency, and ignore the octave.
        self._number = self._t.get_nearest_freq_index(freq)
        # Do we force the pitch to be in the temperament?
        self._freq = self._t.get_freq_by_index(self._number)
        (
            self._semitone_index,
            self._octave,
        ) = self._t.get_modal_index_and_octave_from_freq_index(self._number)
        self._generic_name = self._t.get_note_name(self._semitone_index)

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
        if isinstance(pitch_name, float):
            self._define_by_frequency(pitch_name)
        elif isinstance(pitch_name, int):
            # A few assumptions here: If the int > number of defined
            # in the temperament, assume it is a frequency.  If the
            # int < number of semitones in an octave, assume it is a
            # semitone index.  Otherwise, assume it is an index in the
            # list of frequencies (a pitch number).
            if pitch_name > self._t.get_number_of_notes_in_temperament():
                self._define_by_frequency(pitch_name)
            elif pitch_name > self._t.get_number_of_semitones_in_octave():
                # Assume it is a pitch number
                self._number = pitch_name
                self._freq = self._t.get_freq_by_index(self._number)
                (
                    self._semitone_index,
                    self._octave,
                ) = self._t.get_modal_index_and_octave_from_freq_index(self._number)
                self._generic_name = self._t.get_note_name(self._semitone_index)
            else:
                # Assume it is a semitone index.
                self._semitone_index = pitch_name
                self._octave = octave
                self._generic_name = self._t.get_note_name(self._semitone_index)
                self._freq = self._t.get_freq_by_modal_index_and_octave(
                    self._semitone_index, self._octave
                )
                self._number = self._t.get_nearest_freq_index(self._freq)
        elif isinstance(pitch_name, str):
            # Assume it is a name of some sort.
            self._generic_name = self._s.convert_to_generic_note_name(pitch_name)[0]
            self._semitone_index = self._t.get_modal_index(self._generic_name)
            self._octave = octave
            self._freq = self._t.get_freq_by_modal_index_and_octave(
                self._semitone_index, self._octave
            )
            self._number = self._t.get_nearest_freq_index(self._freq)

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
        self._generic_name, delta_octave = self._s.semitone_transform(
            self._generic_name, number_of_half_steps
        )[0:2]

        self._octave += delta_octave
        self._semitone_index = self._t.get_modal_index(self._generic_name)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )
        self._number = self._t.get_nearest_freq_index(self._freq)

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
        self._generic_name, delta_octave = self._s.scalar_transform(
            self._generic_name, number_of_scalar_steps
        )[0:2]

        self._octave += delta_octave
        self._semitone_index = self._t.get_modal_index(self._generic_name)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )
        self._number = self._t.get_nearest_freq_index(self._freq)

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
        generic_name, delta_octave = self._s.semitone_transform(
            self._generic_name, number_of_half_steps
        )[0:2]
        semitone_index = self._t.get_modal_index(generic_name)
        octave = self._octave + delta_octave
        return self._t.get_freq_by_modal_index_and_octave(semitone_index, octave)

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
        generic_name, delta_octave = self._s.scalar_transform(
            self._generic_name, number_of_scalar_steps
        )[0:2]
        semitone_index = self._t.get_modal_index(generic_name)
        octave = self._octave + delta_octave
        return self._t.get_freq_by_modal_index_and_octave(semitone_index, octave)

    def get_freq(self):
        """
        Returns
        -------
        float
            The frequency of the current note in Hertz
        """
        return self._freq

    def get_octave(self):
        """
        Returns
        -------
        int
            The octave of the current note
        """
        return self._octave

    def get_generic_name(self):
        """
        Returns
        -------
        str
            The generic name of the current note
        """
        return self._generic_name

    def get_semitone_index(self):
        """
        Returns
        -------
        int
            The modal index of the current note
        """
        return self._semitone_index

    def get_number(self):
        """
        Returns
        -------
        int
            The index of the current note within the list of all of the
            notes defined by the temperament
        """
        return self._number

    def __str__(self):
        """
        Returns
        -------
        str
            The frequency of the current pitch
        """
        return "%s: %s" % (self._generic_name, self.get_freq())
