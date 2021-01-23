# -*- coding: utf-8 -*-
"""
Unit tests for musicutils
"""

# Copyright 2021 Walter Bender, Sugar Labs
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the The GNU Affero General Public
# License as published by the Free Software Foundation; either
# version 3 of the License, or (at your option) any later version.
#
# You should have received a copy of the GNU Affero General Public
# License along with this library; if not, write to the Free Software
# Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

import unittest

from temperament import Temperament
from keysignature import KeySignature
from scale import Scale
from currentpitch import CurrentPitch
from musicutils import normalize_pitch, display_pitch, strip_accidental, get_pitch_type
from musicutils import (
    SHARP,
    GENERIC_NOTE_NAME,
    LETTER_NAME,
    SOLFEGE_NAME,
    EAST_INDIAN_SOLFEGE_NAME,
    SCALAR_MODE_NUMBER,
    CUSTOM_NAME,
    UNKNOWN_PITCH_NAME,
)


def compare_scales(scale1, scale2):
    scale1 = scale1[:-1]
    scale1.sort()
    scale2 = scale2[:-1]
    scale2.sort()

    for i in range(len(scale1)):
        if scale1[i] != scale2[i]:
            return False
    return True


def round(f, d):
    i = f * d
    i += 0.5
    return float(int(i)) / d


class MusicUtilsTestCase(unittest.TestCase):
    def current_note_test(self):
        print("CURRENT NOTE TESTS")
        cp = CurrentPitch()
        
        self.assertEqual(
            round(cp.get_freq(), 100), 392.0,
        )
        self.assertEqual(cp.get_generic_name(), "n7")

        cp.scalar_transposition(1)
        self.assertEqual(cp.get_generic_name(), "n9")
        self.assertEqual(
            round(cp.get_freq(), 100), 440.0,
        )
        cp.semitone_transposition(-2)
        self.assertEqual(cp.get_generic_name(), "n7")
        self.assertEqual(
            round(cp.get_freq(), 100), 392.0,
        )

    def scale_test(self):
        print("SCALE TESTS")
        print("c major")
        s = Scale([2, 2, 1, 2, 2, 2, 1], 0)  # C Major
        self.assertTrue(
            compare_scales(
                s.get_scale(), ["n0", "n2", "n4", "n5", "n7", "n9", "n11", "n0"]
            )
        )
        self.assertTrue(
            compare_scales(
                s.get_scale(
                    pitch_format=[
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
                ),
                ["c", "d", "e", "f", "g", "a", "b", "c"],
            )
        )
        print("g major")
        s = Scale([2, 2, 1, 2, 2, 2, 1], 7)  # G Major
        self.assertTrue(
            compare_scales(
                s.get_scale(), ["n7", "n9", "n11", "n0", "n2", "n4", "n6", "n7"]
            )
        )
        self.assertEqual(s.get_scale_and_octave_deltas()[1][3], 1)

    def normalize_test(self):
        print("NORMALIZE TESTS")
        self.assertTrue(normalize_pitch("C" + SHARP) == "c#")
        self.assertTrue(display_pitch("c#") == "C" + SHARP)
        self.assertTrue(strip_accidental("c#")[0] == "c")
        self.assertTrue(strip_accidental("cbb")[0] == "c")
        self.assertTrue(strip_accidental("cbb")[1] == -2)
        self.assertTrue(strip_accidental("cb")[0] == "c")
        self.assertTrue(strip_accidental("cb")[1] == -1)
        self.assertTrue(strip_accidental("b")[0] == "b")
        self.assertTrue(strip_accidental("b")[1] == 0)

    def temperament_test(self):
        print("TEMPERAMENT TESTS")
        print("equal 12")
        t = Temperament()
        self.assertEqual(t.get_name(), "equal")
        t.set_base_frequency(t.C0)
        self.assertEqual(t.get_base_frequency(), t.C0)
        self.assertEqual(t.get_number_of_octaves(), 8)
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 55.0)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

        print("pythagorean")
        t = Temperament(name="pythagorean")
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 55.19)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

        print("just intonation")
        t = Temperament(name="just intonation")
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 54.51)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

        print("quarter comma meantone")
        t = Temperament(name="quarter comma meantone")
        f = t.get_freqs()
        self.assertEqual(round(f[36], 100), 55.45)  # A1
        self.assertEqual(len(t.get_note_names()), 21)

        print("equal 24")
        t = Temperament()
        t.generate_equal_temperament(24)
        f = t.get_freqs()
        self.assertEqual(round(f[42], 100), 55.0)  # A1
        self.assertEqual(len(t.get_note_names()), 24)

        print("test tuning")
        t = Temperament()
        t.tune("a", 4, 440.0)
        self.assertEqual(round(t.get_base_frequency(), 100), 16.35)
        t.tune("a", 4, 441.0)
        self.assertEqual(round(t.get_base_frequency(), 100), 16.39)
        self.assertEqual(round(t.get_freqs()[57], 100), 441.0)

    def key_signature_test(self):
        print("KEY SIGNATURE TESTS")
        ks = KeySignature(mode="major", key="c")
        print("closest note tests")
        self.assertEqual(ks.closest_note("c")[0], "c")
        self.assertTrue(ks.note_in_scale("c"))
        self.assertEqual(ks.closest_note("f#")[0], "f")
        self.assertFalse(ks.note_in_scale("f#"))
        self.assertEqual(ks.closest_note("g#")[0], "g")
        self.assertFalse(ks.note_in_scale("g#"))
        self.assertEqual(ks.closest_note("cb")[0], "b")
        self.assertTrue(ks.note_in_scale("cb"))
        self.assertEqual(ks.closest_note("db")[0], "c")
        self.assertFalse(ks.note_in_scale("db"))
        self.assertEqual(ks.closest_note("n10#")[0], "n11")
        self.assertEqual(ks.closest_note("n10x")[0], "n0")
        self.assertEqual(ks.closest_note("sol")[0], "sol")
        self.assertEqual(ks.closest_note("pa")[0], "pa")

        # Test the scalar and semitone transforms and test for wrap around.
        print("scalar transforms")
        self.assertEqual(ks.scalar_transform("c", 2)[0], "e")
        self.assertEqual(ks.scalar_transform("c", 2)[1], 0)  # no change to octave
        self.assertEqual(ks.scalar_transform("c#", 2)[0], "f")

        print("semitone transforms")
        self.assertEqual(ks.semitone_transform("c", 2)[0], "d")
        self.assertEqual(ks.semitone_transform("c#", 2)[0], "d#")
        self.assertEqual(ks.semitone_transform("b", 1)[0], "c")
        self.assertEqual(ks.semitone_transform("b", 1)[1], 1)  # increment octave
        self.assertEqual(ks.semitone_transform("n3", 1)[0], "n4")
        self.assertEqual(ks.semitone_transform("n3#", 1)[0], "n5")
        self.assertEqual(ks.semitone_transform("n0", -1)[0], "n11")
        self.assertEqual(ks.semitone_transform("n0", -1)[1], -1)  # decrement octave
        self.assertEqual(ks.semitone_transform("n0b", -1)[0], "n10")
        self.assertEqual(ks.semitone_transform("n0b", -1)[1], -1)  # decrement octave
        self.assertEqual(ks.semitone_transform("n1b", -1)[0], "n11")
        self.assertEqual(ks.semitone_transform("n1b", -1)[1], -1)  # decrement octave
        self.assertEqual(ks.semitone_transform("n11x", 1)[0], "n2")
        self.assertEqual(ks.semitone_transform("n11x", 1)[1], 1)  # increment octave

        t = Temperament()
        self.assertEqual(
            int(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("a")[0], 4
                )
                + 0.5
            ),
            440,
        )

        ks = KeySignature(mode="chromatic", key="c")
        self.assertEqual(ks.scalar_transform("c", 2)[0], "d")
        self.assertEqual(ks.scalar_transform("c#", 2)[0], "d#")
        self.assertEqual(ks.semitone_transform("c", 2)[0], "d")
        self.assertEqual(ks.semitone_transform("c#", 2)[0], "d#")
        self.assertEqual(ks.semitone_transform("b", 1)[0], "c")

        t = Temperament(name="third comma meantone")
        ks = KeySignature(
            key="n0",
            # number_of_semitones=t.get_number_of_semitones_in_octave(),
            mode=[2, 2, 1, 2, 2, 2, 7, 1],
        )
        self.assertEqual(len(ks.get_scale()), 8)
        self.assertEqual(ks.get_scale()[7], "n18")
        self.assertEqual(ks.closest_note("n12")[0], "n11")
        self.assertEqual(ks.scalar_transform("n5", 2)[0], "n9")
        self.assertEqual(ks.closest_note("n10#")[0], "n11")

        # Test mode equivalents
        print("mode equivalents")
        ks = KeySignature(key="e", mode="major")
        source = ks.normalize_scale(ks.scale)
        ks = KeySignature(key="db", mode="minor")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="c#", mode="minor")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="eb", mode="locrian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="d#", mode="locrian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="b", mode="mixolydian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="a", mode="lydian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="g#", mode="phrygian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="ab", mode="phrygian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="f#", mode="dorian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="gb", mode="dorian")
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="e", mode=[2, 2, 1, 2, 2, 2, 1])
        target = ks.normalize_scale(ks.scale)
        self.assertTrue(compare_scales(source, target))

        # Test Solfege mapper
        print("solfege mapper")
        ks = KeySignature(key="c", mode="major")
        self.assertEqual(len(ks.solfege_notes), 8)

        ks = KeySignature(key="c", mode="major pentatonic")
        self.assertEqual(len(ks.solfege_notes), 6)
        self.assertEqual(ks.solfege_notes[2], "me")
        self.assertEqual(ks.solfege_notes[3], "sol")

        ks = KeySignature(key="c", mode="minor pentatonic")
        self.assertEqual(len(ks.solfege_notes), 6)
        self.assertEqual(ks.solfege_notes[2], "fa")
        self.assertEqual(ks.solfege_notes[3], "sol")

        ks = KeySignature(key="c", mode="whole tone")
        self.assertEqual(len(ks.solfege_notes), 7)
        self.assertEqual(ks.solfege_notes[2], "me")
        self.assertEqual(ks.solfege_notes[4], "sol")

        ks = KeySignature(key="c", mode="chromatic")
        self.assertEqual(len(ks.solfege_notes), 13)
        self.assertEqual(ks.solfege_notes[2], "re")
        self.assertEqual(ks.solfege_notes[3], "meb")

        ks = KeySignature()
        self.assertEqual(ks.convert_to_generic_note_name("g")[0], "n7")
        self.assertEqual(ks.convert_to_generic_note_name("sol")[0], "n7")
        self.assertEqual(ks.convert_to_generic_note_name("5")[0], "n7")
        self.assertEqual(ks.convert_to_generic_note_name("pa")[0], "n7")
        self.assertEqual(ks.convert_to_generic_note_name("g#")[0], "n8")
        self.assertEqual(ks.convert_to_generic_note_name("sol#")[0], "n8")
        self.assertEqual(ks.convert_to_generic_note_name("5#")[0], "n8")
        self.assertEqual(ks.convert_to_generic_note_name("pa#")[0], "n8")

        ks.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )
        self.assertEqual(ks.convert_to_generic_note_name("golf")[0], "n7")
        self.assertEqual(ks.convert_to_generic_note_name("golf#")[0], "n8")

        self.assertEqual(ks.semitone_transform("g", 3)[0], "a#")
        self.assertEqual(ks.semitone_transform("n7", 3)[0], "n10")
        self.assertEqual(ks.semitone_transform("sol", 3)[0], "tib")
        self.assertEqual(ks.semitone_transform("5", 3)[0], "7b")
        self.assertEqual(ks.semitone_transform("pa", 3)[0], "nib")
        self.assertEqual(ks.semitone_transform("golf", 3)[0], "n10")

        print("type conversions")
        self.assertEqual(ks.generic_note_name_to_solfege("n7")[0], "sol")
        self.assertEqual(ks.generic_note_name_to_solfege("n8")[0], "sol#")
        self.assertEqual(ks.generic_note_name_to_solfege("n9")[0], "la")
        self.assertEqual(ks.generic_note_name_to_east_indian_solfege("n7")[0], "pa")
        self.assertEqual(ks.generic_note_name_to_scalar_mode_number("n7")[0], "5")
        self.assertEqual(ks.generic_note_name_to_custom_note_name("n7")[0], "golf")

        print("pitch type check")
        self.assertEqual(ks.pitch_name_type("g"), LETTER_NAME)
        self.assertEqual(ks.pitch_name_type("c#"), LETTER_NAME)
        self.assertEqual(ks.pitch_name_type("n7"), GENERIC_NOTE_NAME)
        self.assertEqual(ks.pitch_name_type("n7b"), GENERIC_NOTE_NAME)
        self.assertEqual(ks.pitch_name_type("sol"), SOLFEGE_NAME)
        self.assertEqual(ks.pitch_name_type("sol#"), SOLFEGE_NAME)
        self.assertEqual(ks.pitch_name_type("pa"), EAST_INDIAN_SOLFEGE_NAME)
        self.assertEqual(ks.pitch_name_type("5"), SCALAR_MODE_NUMBER)
        self.assertEqual(ks.pitch_name_type("golf"), CUSTOM_NAME)
        self.assertEqual(ks.pitch_name_type("foobar"), UNKNOWN_PITCH_NAME)
        self.assertEqual(get_pitch_type("g"), LETTER_NAME)
        self.assertEqual(get_pitch_type("c#"), LETTER_NAME)
        self.assertEqual(get_pitch_type("n7"), GENERIC_NOTE_NAME)
        self.assertEqual(get_pitch_type("n7b"), GENERIC_NOTE_NAME)
        self.assertEqual(get_pitch_type("sol"), SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("sol#"), SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("pa"), EAST_INDIAN_SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("5"), SCALAR_MODE_NUMBER)
        self.assertEqual(get_pitch_type("foobar"), UNKNOWN_PITCH_NAME)

        # Test fixed Solfege
        print("fixed solfege")
        ks = KeySignature(key="g", mode="major")
        self.assertEqual(ks.convert_to_generic_note_name("sol")[0], "n7")
        ks.set_fixed_solfege(True)
        self.assertEqual(ks.convert_to_generic_note_name("do")[0], "n7")

        print("frequency conversion")
        t = Temperament()
        ks = KeySignature()
        ks.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )

        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("g")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("sol")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("5")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("pa")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    ks.convert_to_generic_note_name("golf")[0], 4
                ),
                100,
            ),
            392.0,
        )

        print("Testing meantone scales")
        ks = KeySignature(mode=[], number_of_semitones=21)
        self.assertEqual(ks.closest_note("cb")[0], "cb")
        self.assertEqual(ks.semitone_transform("gb", 1)[0], "g")
        self.assertEqual(ks.semitone_transform("cb", 3)[0], "d")
        self.assertEqual(ks.semitone_transform("c", -3)[0], "bb")
        ks = KeySignature(mode=[3, 3, 3, 3, 3, 3, 3], number_of_semitones=21)
        self.assertEqual(ks.closest_note("cb")[0], "c")
        self.assertEqual(ks.closest_note("db")[0], "d")
        self.assertEqual(ks.closest_note("c#")[0], "c")
        self.assertEqual(ks.scalar_transform("c", 1)[0], "d")
        ks = KeySignature(number_of_semitones=21)
        self.assertEqual(ks.closest_note("cb")[0], "c")
        self.assertEqual(ks.closest_note("db")[0], "d")
        self.assertEqual(ks.closest_note("c#")[0], "c")
        self.assertEqual(ks.scalar_transform("c", 1)[0], "d")
        ks = KeySignature(key="bb", mode="lydian", number_of_semitones=21)
        self.assertEqual(ks.closest_note("bb")[0], "bb")
        self.assertEqual(ks.closest_note("n18")[0], "n17")

    def print_scales_test(self):
        ks = KeySignature(key="c", mode="ionian")
        print(ks)
        ks = KeySignature(key="d", mode="dorian")
        print(ks)
        ks = KeySignature(key="e", mode="phrygian")
        print(ks)
        ks = KeySignature(key="f", mode="lydian")
        print(ks)
        ks = KeySignature(key="g", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="a", mode="aeolian")
        print(ks)
        ks = KeySignature(key="b", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="g", mode="ionian")
        print(ks)
        ks = KeySignature(key="a", mode="dorian")
        print(ks)
        ks = KeySignature(key="b", mode="phrygian")
        print(ks)
        ks = KeySignature(key="c", mode="lydian")
        print(ks)
        ks = KeySignature(key="d", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="e", mode="aeolian")
        print(ks)
        ks = KeySignature(key="f#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="d", mode="ionian")
        print(ks)
        ks = KeySignature(key="e", mode="dorian")
        print(ks)
        ks = KeySignature(key="f#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="g", mode="lydian")
        print(ks)
        ks = KeySignature(key="a", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="b", mode="aeolian")
        print(ks)
        ks = KeySignature(key="c#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="a", mode="ionian")
        print(ks)
        ks = KeySignature(key="b", mode="dorian")
        print(ks)
        ks = KeySignature(key="c#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="d", mode="lydian")
        print(ks)
        ks = KeySignature(key="e", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="f#", mode="aeolian")
        print(ks)
        ks = KeySignature(key="g#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="e", mode="ionian")
        print(ks)
        ks = KeySignature(key="f#", mode="dorian")
        print(ks)
        ks = KeySignature(key="g#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="a", mode="lydian")
        print(ks)
        ks = KeySignature(key="b", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="c#", mode="aeolian")
        print(ks)
        ks = KeySignature(key="d#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="b", mode="ionian")
        print(ks)
        ks = KeySignature(key="c#", mode="dorian")
        print(ks)
        ks = KeySignature(key="d#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="e", mode="lydian")
        print(ks)
        ks = KeySignature(key="f#", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="g#", mode="aeolian")
        print(ks)
        ks = KeySignature(key="a#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="f#", mode="ionian")
        print(ks)
        ks = KeySignature(key="g#", mode="dorian")
        print(ks)
        ks = KeySignature(key="a#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="b", mode="lydian")
        print(ks)
        ks = KeySignature(key="c#", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="d#", mode="aeolian")
        print(ks)
        ks = KeySignature(key="e#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="c#", mode="ionian")
        print(ks)
        ks = KeySignature(key="d#", mode="dorian")
        print(ks)
        ks = KeySignature(key="e#", mode="phrygian")
        print(ks)
        ks = KeySignature(key="f#", mode="lydian")
        print(ks)
        ks = KeySignature(key="g#", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="a#", mode="aeolian")
        print(ks)
        ks = KeySignature(key="b#", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="f", mode="ionian")
        print(ks)
        ks = KeySignature(key="g", mode="dorian")
        print(ks)
        ks = KeySignature(key="a", mode="phrygian")
        print(ks)
        ks = KeySignature(key="bb", mode="lydian")
        print(ks)
        ks = KeySignature(key="c", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="d", mode="aeolian")
        print(ks)
        ks = KeySignature(key="e", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="bb", mode="ionian")
        print(ks)
        ks = KeySignature(key="c", mode="dorian")
        print(ks)
        ks = KeySignature(key="d", mode="phrygian")
        print(ks)
        ks = KeySignature(key="eb", mode="lydian")
        print(ks)
        ks = KeySignature(key="f", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="g", mode="aeolian")
        print(ks)
        ks = KeySignature(key="a", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="eb", mode="ionian")
        print(ks)
        ks = KeySignature(key="f", mode="dorian")
        print(ks)
        ks = KeySignature(key="g", mode="phrygian")
        print(ks)
        ks = KeySignature(key="ab", mode="lydian")
        print(ks)
        ks = KeySignature(key="bb", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="c", mode="aeolian")
        print(ks)
        ks = KeySignature(key="d", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="ab", mode="ionian")
        print(ks)
        ks = KeySignature(key="bb", mode="dorian")
        print(ks)
        ks = KeySignature(key="c", mode="phrygian")
        print(ks)
        ks = KeySignature(key="db", mode="lydian")
        print(ks)
        ks = KeySignature(key="eb", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="f", mode="aeolian")
        print(ks)
        ks = KeySignature(key="g", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="db", mode="ionian")
        print(ks)
        ks = KeySignature(key="eb", mode="dorian")
        print(ks)
        ks = KeySignature(key="fb", mode="phrygian")
        print(ks)
        ks = KeySignature(key="gb", mode="lydian")
        print(ks)
        ks = KeySignature(key="ab", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="bb", mode="aeolian")
        print(ks)
        ks = KeySignature(key="c", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="gb", mode="ionian")
        print(ks)
        ks = KeySignature(key="ab", mode="dorian")
        print(ks)
        ks = KeySignature(key="bb", mode="phrygian")
        print(ks)
        ks = KeySignature(key="cb", mode="lydian")
        print(ks)
        ks = KeySignature(key="db", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="eb", mode="aeolian")
        print(ks)
        ks = KeySignature(key="f", mode="locrian")
        print(ks)
        print()
        ks = KeySignature(key="cb", mode="ionian")
        print(ks)
        ks = KeySignature(key="db", mode="dorian")
        print(ks)
        ks = KeySignature(key="eb", mode="phrygian")
        print(ks)
        ks = KeySignature(key="fb", mode="lydian")
        print(ks)
        ks = KeySignature(key="gb", mode="mixolydian")
        print(ks)
        ks = KeySignature(key="ab", mode="aeolian")
        print(ks)
        ks = KeySignature(key="bb", mode="locrian")
        print(ks)
        print()

        for m in [
            "major pentatonic",
            "minor pentatonic",
            "whole tone",
        ]:
            for k in ["c", "g", "d", "a", "e", "b", "f#", "db", "ab", "eb", "bb", "f"]:
                ks = KeySignature(key=k, mode=m)
                print(ks)


if __name__ == "__main__":
    unittest.main()
