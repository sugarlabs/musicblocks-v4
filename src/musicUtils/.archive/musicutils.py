# -*- coding: utf-8 -*-
"""
Utilities and constants
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

SHARP = "♯"
FLAT = "♭"
NATURAL = "♮"
DOUBLESHARP = "𝄪"
DOUBLEFLAT = "𝄫"
CHROMATIC_NOTES_SHARP = [
    "c",
    "c#",
    "d",
    "d#",
    "e",
    "f",
    "f#",
    "g",
    "g#",
    "a",
    "a#",
    "b",
]
CHROMATIC_NOTES_FLAT = ["c", "db", "d", "eb", "e", "f", "gb", "g", "ab", "a", "bb", "b"]
# Meantone temperaments use 21 notes
ALL_NOTES = [
    "c",
    "c#",
    "db",
    "d",
    "d#",
    "eb",
    "e",
    "e#",
    "fb",
    "f",
    "f#",
    "gb",
    "g",
    "g#",
    "ab",
    "a",
    "a#",
    "bb",
    "b",
    "b#",
    "cb",
]
SCALAR_MODE_NUMBERS = ["1", "2", "3", "4", "5", "6", "7"]
SOLFEGE_NAMES = ["do", "re", "me", "fa", "sol", "la", "ti"]
EAST_INDIAN_NAMES = ["sa", "re", "ga", "ma", "pa", "dha", "ni"]
EQUIVALENT_FLATS = {
    "c#": "db",
    "d#": "eb",
    "f#": "gb",
    "g#": "ab",
    "a#": "bb",
    "e#": "f",
    "b#": "c",
    "cb": "cb",
    "fb": "fb",
}
EQUIVALENT_SHARPS = {
    "db": "c#",
    "eb": "d#",
    "gb": "f#",
    "ab": "g#",
    "bb": "a#",
    "cb": "b",
    "fb": "e",
    "e#": "e#",
    "b#": "b#",
}
# This notation only applies to temperaments with 12 semitones.
PITCH_LETTERS = ["c", "d", "e", "f", "g", "a", "b"]

# These defintions are only relevant to equal temperament.
SOLFEGE_SHARP = [
    "do",
    "do#",
    "re",
    "re#",
    "me",
    "fa",
    "fa#",
    "sol",
    "sol#",
    "la",
    "la#",
    "ti",
]
SOLFEGE_FLAT = [
    "do",
    "reb",
    "re",
    "meb",
    "me",
    "fa",
    "solb",
    "sol",
    "lab",
    "la",
    "tib",
    "ti",
]
EAST_INDIAN_SHARP = [
    "sa",
    "sa#",
    "re",
    "re#",
    "ga",
    "ma",
    "ma#",
    "pa",
    "pa#",
    "dha",
    "dha#",
    "ni",
]
EAST_INDIAN_FLAT = [
    "sa",
    "reb",
    "re",
    "gab",
    "ga",
    "ma",
    "pab",
    "pa",
    "dhab",
    "dha",
    "nib",
    "ni",
]
SCALAR_NAMES_SHARP = [
    "1",
    "1#",
    "2",
    "2#",
    "3",
    "4",
    "4#",
    "5",
    "5#",
    "6",
    "6#",
    "7",
]
SCALAR_NAMES_FLAT = [
    "1",
    "2b",
    "2",
    "3b",
    "3",
    "4",
    "4b",
    "5",
    "6b",
    "6",
    "7b",
    "7",
]
EQUIVALENTS = {
    "ax": ["b", "cb"],
    "a#": ["bb"],
    "a": ["a", "bbb", "gx"],
    "ab": ["g#"],
    "abb": ["g", "fx"],
    "bx": ["c#"],
    "b#": ["c", "dbb"],
    "b": ["b", "cb", "ax"],
    "bb": ["a#"],
    "bbb": ["a", "gx"],
    "cx": ["d"],
    "c#": ["db"],
    "c": ["c", "dbb", "b#"],
    "cb": ["b"],
    "cbb": ["bb", "a#"],
    "dx": ["e", "fb"],
    "d#": ["eb", "fbb"],
    "d": ["d", "ebb", "cx"],
    "db": ["c#", "bx"],
    "dbb": ["c", "b#"],
    "ex": ["f#", "gb"],
    "e#": ["f", "gbb"],
    "e": ["e", "fb", "dx"],
    "eb": ["d#", "fbb"],
    "ebb": ["d", "cx"],
    "fx": ["g", "abb"],
    "f#": ["gb", "ex"],
    "f": ["f", "e#", "gbb"],
    "fb": ["e", "dx"],
    "fbb": ["eb", "d#"],
    "gx": ["a", "bbb"],
    "g#": ["ab"],
    "g": ["g", "abb", "fx"],
    "gb": ["f#", "ex"],
    "gbb": ["f", "e#"],
}
CONVERT_DOWN = {
    "c": "b#",
    "cb": "b",
    "cbb": "a#",
    "d": "cx",
    "db": "c#",
    "dbb": "c",
    "e": "dx",
    "eb": "d#",
    "ebb": "d",
    "f": "e#",
    "fb": "e",
    "fbb": "d#",
    "g": "fx",
    "gb": "f#",
    "gbb": "f",
    "a": "gx",
    "ab": "g#",
    "abb": "g",
    "b": "ax",
    "bb": "a#",
    "bbb": "a",
}
CONVERT_UP = {
    "cx": "d",
    "c#": "db",
    "c": "dbb",
    "dx": "e",
    "d#": "eb",
    "d": "ebb",
    "ex": "f#",
    "e#": "f",
    "e": "fb",
    "fx": "g",
    "f#": "gb",
    "f": "gbb",
    "gx": "a",
    "g#": "ab",
    "g": "abb",
    "ax": "b",
    "a#": "bb",
    "a": "bbb",
    "bx": "c#",
    "b#": "c",
    "b": "cb",
}

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
    if len(pitch) == 1:
        return pitch, 0
    # The ASCII versions
    if len(pitch) > 2 and pitch.endswith("bb"):
        return pitch.strip("bb"), -2
    if pitch.endswith("b"):
        return pitch.strip("b"), -1
    if pitch.endswith("#"):
        return pitch.rstrip("#"), 1
    if pitch.endswith("x"):
        return pitch.rstrip("x"), 2
    # And the Unicode versions...
    if pitch.endswith(DOUBLEFLAT):
        return pitch.strip(DOUBLEFLAT), -2
    if pitch.endswith(FLAT):
        return pitch.strip(FLAT), -1
    if pitch.endswith(SHARP):
        return pitch.rstrip(SHARP), 1
    if pitch.endswith(DOUBLESHARP):
        return pitch.rstrip(DOUBLESHARP), 2
    if pitch.endswith(NATURAL):
        return pitch.rstrip(NATURAL), 0
    # No accidentals were present.
    return pitch, 0


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
    if isinstance(pitch, (int, float)):
        return pitch
    pitch = pitch.lower()
    pitch = pitch.replace(SHARP, "#")
    pitch = pitch.replace(DOUBLESHARP, "x")
    pitch = pitch.replace(FLAT, "b")
    pitch = pitch.replace(DOUBLEFLAT, "bb")
    pitch = pitch.replace(NATURAL, "")
    return pitch


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
    # Ignore pitch numbers and pitch expressed as Hertz
    if isinstance(pitch, (int, float)):
        return pitch
    pitch_to_display = pitch[0].upper()
    if len(pitch) > 2 and pitch[1:2] == "bb":
        pitch_to_display += DOUBLEFLAT
    elif len(pitch) > 1:
        if pitch[1] == "#":
            pitch_to_display += SHARP
        elif pitch[1].lower() == "x":
            pitch_to_display += DOUBLESHARP
        elif pitch[1].lower() == "b":
            pitch_to_display += FLAT
    return pitch_to_display


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
    return pitch_name.endswith("#") or pitch_name in PITCH_LETTERS


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
    if pitch_name in CHROMATIC_NOTES_SHARP:
        return CHROMATIC_NOTES_SHARP.index(pitch_name)
    if pitch_name in CONVERT_UP:
        new_pitch_name = CONVERT_UP[pitch_name]
        if new_pitch_name in CHROMATIC_NOTES_SHARP:
            return CHROMATIC_NOTES_SHARP.index(new_pitch_name)
    print("Could not find sharp index for", pitch_name)
    return 0


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
    return pitch_name.endswith("b") or pitch_name in PITCH_LETTERS


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
    if pitch_name in CHROMATIC_NOTES_FLAT:
        return CHROMATIC_NOTES_FLAT.index(pitch_name)
    if pitch_name in CONVERT_DOWN:
        new_pitch_name = CONVERT_DOWN[pitch_name]
        if new_pitch_name in CHROMATIC_NOTES_FLAT:
            return CHROMATIC_NOTES_FLAT.index(new_pitch_name)
    print("Could not find flat index for", pitch_name)
    return 0


def get_pitch_type(pitch_name):
    """
    Pitches can be specified as a letter name, a solfege name, etc.
    """
    pitch_name = normalize_pitch(pitch_name)
    if pitch_name in CHROMATIC_NOTES_SHARP:
        return LETTER_NAME
    if pitch_name in CHROMATIC_NOTES_FLAT:
        return LETTER_NAME
    if pitch_name in EQUIVALENT_SHARPS:
        return LETTER_NAME
    if pitch_name in EQUIVALENT_FLATS:
        return LETTER_NAME
    pitch_name = strip_accidental(pitch_name)[0]
    if pitch_name[0] == "n" and pitch_name[1:].isdecimal():
        return GENERIC_NOTE_NAME
    if pitch_name in SOLFEGE_NAMES:
        return SOLFEGE_NAME
    if pitch_name in EAST_INDIAN_NAMES:
        return EAST_INDIAN_SOLFEGE_NAME
    if pitch_name in SCALAR_MODE_NUMBERS:
        return SCALAR_MODE_NUMBER
    return UNKNOWN_PITCH_NAME
