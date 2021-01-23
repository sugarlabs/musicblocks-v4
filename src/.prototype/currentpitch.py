# -*- coding: utf-8 -*-
"""
The Current Pitch class defines an object that manages pitch state.
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


from temperament import Temperament
from keysignature import KeySignature
from scale import Scale


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

        self._semitone_index = i
        self._octave = octave

        self._generic_name = self._t.get_note_name(self._semitone_index)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )

    def semitone_transposition(self, number_of_half_steps):
        self._generic_name, delta_octave, error = self._ks.semitone_transform(
            self._generic_name, number_of_half_steps
        )

        self._octave += delta_octave
        self._semitone_index = self._t.get_modal_index(self._generic_name)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )

    def scalar_transposition(self, number_of_scalar_steps):
        self._generic_name, delta_octave = self._ks.scalar_transform(
            self._generic_name, number_of_scalar_steps
        )

        self._octave += delta_octave
        self._semitone_index = self._t.get_modal_index(self._generic_name)
        self._freq = self._t.get_freq_by_modal_index_and_octave(
            self._semitone_index, self._octave
        )

    def get_freq(self):
        return self._freq

    def get_octave(self):
        return self._octave

    def get_generic_name(self):
        return self._generic_name
