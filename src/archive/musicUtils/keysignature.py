# -*- coding: utf-8 -*-
"""
The KeySignature class defines an object that manages a specific
key/mode combination.
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

from scale import Scale
from musicutils import (
    normalize_pitch,
    find_sharp_index,
    find_flat_index,
)
from musicutils import (
    CHROMATIC_NOTES_SHARP,
    CHROMATIC_NOTES_FLAT,
    EQUIVALENT_FLATS,
    EQUIVALENT_SHARPS,
)


class KeySignature:
    """
    A key signature is a set of sharp, flat, and natural symbols.
    """

    # Predefined modes are defined by the number of semitones between notes.
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

    # These key signaturs (and their equivalents) prefer sharps over flats.
    PREFER_SHARPS = [
        "c major",
        "c major pentatonic",
        "c major blues",
        "c whole tone",
        "d dorian",
        "e phrygian",
        "f lydian",
        "g mixolydian",
        "a minor",
        "a minor pentatonic",
        "b locrian",
        "g major",
        "g major pentatonic",
        "g major blues",
        "g whole tone",
        "a dorian",
        "b phrygian",
        "c lydian",
        "d mixolydian",
        "e minor",
        "e minor pentatonic",
        "f# locrian",
        "d major",
        "d major pentatonic",
        "d major blues",
        "d whole tone",
        "e dorian",
        "f# phrygian",
        "g lydian",
        "a mixolydian",
        "b minor",
        "b minor pentatonic",
        "c# locrian",
        "a major",
        "a major pentatonic",
        "a major blues",
        "a whole tone",
        "b dorian",
        "c# phrygian",
        "d lydian",
        "e mixolydian",
        "f# minor",
        "f# minor pentatonic",
        "e major",
        "e major pentatonic",
        "e major blues",
        "e whole tone",
        "f# dorian",
        "a lydian",
        "b mixolydian",
        "c# minor",
        "c# minor pentatonic",
        "b major",
        "b major pentatonic",
        "b major blues",
        "b whole tone",
        "c# dorian",
        "d# phrygian",
        "e lydian",
        "f# mixolydian",
        "g# minor",
        "g# minor pentatonic",
        "a# locrian",
    ]

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

        prefer_sharps = True
        if isinstance(mode, str):
            mode = mode.lower()
            # Some mode names imply a specific key.
            if mode in self.MAQAM_KEY_OVERRIDES:
                # Override the key.
                key = self.MAQAM_KEY_OVERRIDES[mode]
                mode = "maqam"
            if mode in self.MUSICAL_MODES:
                self.mode = mode
                self.half_steps = self.MUSICAL_MODES[self.mode]
            else:
                print("mode not found")
                self.mode = "chromatic"
                self.half_steps = self.MUSICAL_MODES[self.mode]
        elif isinstance(mode, list):
            self.mode = "custom"  # We could look for a match
            self.half_steps = mode

        self.key = key
        i = 0
        if isinstance(self.key, str):
            key = normalize_pitch(key)
            prefer_sharps = self._prefer_sharps(self.key, self.mode) or "#" in self.key
            if prefer_sharps:
                if self.key not in CHROMATIC_NOTES_SHARP:
                    self.key = EQUIVALENT_SHARPS[self.key]
                i = find_sharp_index(self.key)
            elif self.key in CHROMATIC_NOTES_FLAT or "b" in self.key:
                if self.key not in CHROMATIC_NOTES_FLAT:
                    self.key = EQUIVALENT_FLATS[self.key]
                i = find_flat_index(self.key)
            elif self.key[0] == "n" and self.key[1:].isdecimal():
                i = int(self.key[1:])  # This is not very robust.
            else:
                print("Could not find key index:", self.key)
        elif isinstance(self.key, int):
            i = self.key
        else:
            print("bad key type", type(key))

        if len(self.half_steps) == 0:
            self.scale = Scale(
                starting_index=i, number_of_semitones=number_of_semitones, key=self.key
            )
        else:
            self.scale = Scale(
                half_steps_pattern=self.half_steps,
                starting_index=i,
                number_of_semitones=number_of_semitones,
                prefer_sharps=prefer_sharps,
                key=self.key,
            )

        # The generic names of the notes found in the scale defined by
        # this key and mode
        self.number_of_semitones = self.scale.get_number_of_semitones()
        self.fixed_solfege = False

        if self.scale.letter_names is not None:
            self.notes_in_scale = self.scale.letter_names[:]
        else:
            self.notes_in_scale = self.scale.get_scale()

        self.key_signature = "%s %s" % (self.key, self.mode)

    def set_fixed_solfege(self, state=False):
        """
        Fixed Solfege means that the mapping between Solfege and
        letter names is fixed: do == c, re == d, ...

        Moveable (not fixed) Solfege means that do == the first note
        in the scale, etc.

        Parameters
        ----------
        state : boolean
            State to set fixed Solfege: True or False
        """
        self.scale.set_fixed_solfege(state)

    def get_fixed_solfege(self):
        """
        Returns the fixed Solfege state

        Returns
        -------
        boolean
            State of fixed Solfege
        """
        return self.scale.get_fixed_solfege()

    def get_notes_in_scale(self):
        """
        The (scalar) notes in the scale.

        Returns
        -------
        list
            The (scalar) notes in the scale.

        NOTE: The internal definition of the scale includes the octave.
        """
        return self.scale.notes_in_scale[:-1]

    def get_mode_length(self):
        """
        How many notes are in the scale?

        Returns
        -------
        int
            The number of (scalar) notes in the scale.
        """
        return len(self.scale.notes_in_scale) - 1

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
        return self.number_of_semitones

    def get_scale(self):
        """
        The Scale object associated with this key signature

        Returns
        -------
        obj
            Scale object
        """
        return self.scale

    def _prefer_sharps(self, key, mode):
        """
        Some keys prefer to use sharps rather than flats.
        """
        return "%s %s" % (key, mode) in self.PREFER_SHARPS

    def __str__(self):
        """
        Return the key, mode, number of half steps, and the scale.
        """
        half_steps = []
        for i in range(len(self.half_steps)):
            half_steps.append(str(self.half_steps[i]))
        scale = " ".join(self.scale.notes_in_scale)
        if len(self.key) > 1:
            key = "%s%s" % (self.key[0].upper(), self.key[1:])
        else:
            key = self.key.upper()
        return "%s %s [%s]" % (key, self.mode.upper(), scale)
