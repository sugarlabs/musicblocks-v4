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
    CUSTOM_NAME,
    UNKNOWN_PITCH_NAME,
    SOLFEGE_NAME,
    EAST_INDIAN_SOLFEGE_NAME,
    SCALAR_MODE_NUMBER,
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
    def test_current_note(self):
        cp = CurrentPitch()

        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        self.assertEqual(cp.get_generic_name(), "n7")

        cp.apply_scalar_transposition(1)
        self.assertEqual(cp.get_generic_name(), "n9")
        self.assertEqual(
            round(cp.get_freq(), 100),
            440.0,
        )
        self.assertEqual(
            round(cp.get_scalar_interval(-1), 100),
            392.0,
        )
        cp.apply_semitone_transposition(-2)
        self.assertEqual(cp.get_generic_name(), "n7")
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        self.assertEqual(
            round(cp.get_semitone_interval(2), 100),
            440.0,
        )
        cp.set_pitch(440.0)
        self.assertEqual(cp.get_generic_name(), "n9")
        cp.set_pitch(7, 4)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch("n7", 4)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch("g", 4)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch("sol", 4)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch(7, 4)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch(392)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )
        cp.set_pitch(55)
        self.assertEqual(
            round(cp.get_freq(), 100),
            392.0,
        )

    def test_c_major_scale(self):
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

    def test_g_major_scale(self):
        s = Scale([2, 2, 1, 2, 2, 2, 1], 7)  # G Major
        self.assertTrue(
            compare_scales(
                s.get_scale(), ["n7", "n9", "n11", "n0", "n2", "n4", "n6", "n7"]
            )
        )
        self.assertEqual(s.get_scale_and_octave_deltas()[1][3], 1)

    def test_normalize_pitch(self):
        self.assertTrue(normalize_pitch("C" + SHARP) == "c#")
        self.assertTrue(display_pitch("c#") == "C" + SHARP)
        self.assertTrue(strip_accidental("c#")[0] == "c")
        self.assertTrue(strip_accidental("cbb")[0] == "c")
        self.assertTrue(strip_accidental("cbb")[1] == -2)
        self.assertTrue(strip_accidental("cb")[0] == "c")
        self.assertTrue(strip_accidental("cb")[1] == -1)
        self.assertTrue(strip_accidental("b")[0] == "b")
        self.assertTrue(strip_accidental("b")[1] == 0)

    def test_normalize_scale(self):
        s = Scale()
        normalized_scale = s.normalize_scale(
            ["c", "cx", "fbb", "f", "g", "a", "b", "c"]
        )
        self.assertEqual(normalized_scale[1], "d")
        self.assertEqual(normalized_scale[2], "eb")

    def test_equal_12_temperament(self):
        t = Temperament()
        self.assertEqual(t.get_name(), "equal")
        t.set_base_frequency(t.C0)
        self.assertEqual(t.get_base_frequency(), t.C0)
        self.assertEqual(t.get_number_of_octaves(), 8)
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 55.0)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

        # A4 should be th 57th note
        self.assertEqual(t.get_freq_index_by_generic_note_name_and_octave("n9", 4), 57)
        self.assertEqual(
            round(t.get_freq_by_generic_note_name_and_octave("n9", 4), 100), 440.0
        )
        self.assertEqual(t.get_generic_note_name_and_octave_by_freq_index(57)[0], "n9")
        self.assertEqual(t.get_generic_note_name_and_octave_by_freq_index(57)[1], 4)

    def test_pythagorean_temperament(self):
        t = Temperament(name="pythagorean")
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 55.19)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

    def test_just_intonaton_temperament(self):
        t = Temperament(name="just intonation")
        f = t.get_freqs()
        self.assertEqual(round(f[21], 100), 54.51)  # A1
        self.assertEqual(len(t.get_note_names()), 12)

    def test_quarter_comma_meantone_temperament(self):
        t = Temperament(name="quarter comma meantone")
        f = t.get_freqs()
        self.assertEqual(round(f[36], 100), 55.45)  # A1
        self.assertEqual(len(t.get_note_names()), 21)

    def test_equal_24_temperament(self):
        t = Temperament()
        t.generate_equal_temperament(24)
        f = t.get_freqs()
        self.assertEqual(round(f[42], 100), 55.0)  # A1
        self.assertEqual(len(t.get_note_names()), 24)

    def test_tuning(self):
        t = Temperament()
        t.tune("a", 4, 440.0)
        self.assertEqual(round(t.get_base_frequency(), 100), 16.35)
        t.tune("a", 4, 441.0)
        self.assertEqual(round(t.get_base_frequency(), 100), 16.39)
        self.assertEqual(round(t.get_freqs()[57], 100), 441.0)

    def test_octave_ratio(self):
        t = Temperament()
        t.set_octave_ratio(4)
        t.generate_equal_temperament(12)
        f = t.get_freqs()
        self.assertEqual(round(f[6], 100), round(f[0] * 2, 100))
        self.assertEqual(round(f[12], 100), round(f[0] * 4, 100))

    def test_key_signature(self):
        ks = KeySignature(mode="major", key="c")
        self.assertEqual(ks.get_mode_length(), 7)
        self.assertEqual(ks.get_number_of_semitones(), 12)

    def test_closest_note(self):
        s = Scale()
        self.assertEqual(s.closest_note("c")[0], "c")
        self.assertTrue(s.note_in_scale("c"))
        self.assertEqual(s.closest_note("f#")[0], "f")
        self.assertFalse(s.note_in_scale("f#"))
        self.assertEqual(s.closest_note("g#")[0], "g")
        self.assertFalse(s.note_in_scale("g#"))
        self.assertEqual(s.closest_note("cb")[0], "b")
        self.assertTrue(s.note_in_scale("cb"))
        self.assertEqual(s.closest_note("db")[0], "c")
        self.assertFalse(s.note_in_scale("db"))
        self.assertEqual(s.closest_note("n10#")[0], "n11")
        self.assertEqual(s.closest_note("n10x")[0], "n0")
        self.assertEqual(s.closest_note("sol")[0], "sol")
        self.assertEqual(s.closest_note("pa")[0], "pa")

    def test_semitone_distance(self):
        s = Scale()
        self.assertEqual(s.semitone_distance("g", 4, "c", 4), -7)
        self.assertEqual(s.semitone_distance("c", 4, "g", 4), 7)
        self.assertEqual(s.semitone_distance("g", 3, "c", 4), 5)
        self.assertEqual(s.semitone_distance("c", 4, "g", 3), -5)

    def test_scalar_distance(self):
        s = Scale()
        self.assertEqual(s.scalar_distance("c", 3, "c", 4)[0], 7)
        self.assertEqual(s.scalar_distance("g", 4, "c", 4)[0], -4)
        self.assertEqual(s.scalar_distance("c", 4, "g", 4)[0], 4)
        self.assertEqual(s.scalar_distance("g", 3, "c", 4)[0], 3)
        self.assertEqual(s.scalar_distance("c", 4, "g", 3)[0], -3)

    def test_scalar_transform(self):
        s = Scale()
        self.assertEqual(s.scalar_transform("c", 2)[0], "e")
        self.assertEqual(s.scalar_transform("c", 2)[1], 0)  # no change to octave
        self.assertEqual(s.scalar_transform("c#", 2)[0], "f")

    def test_semitone_transform(self):
        s = Scale()
        self.assertEqual(s.semitone_transform("c", 2)[0], "d")
        self.assertEqual(s.semitone_transform("c#", 2)[0], "d#")
        self.assertEqual(s.semitone_transform("b", 1)[0], "c")
        self.assertEqual(s.semitone_transform("b", 1)[1], 1)  # increment octave
        self.assertEqual(s.semitone_transform("n3", 1)[0], "n4")
        self.assertEqual(s.semitone_transform("n3#", 1)[0], "n5")
        self.assertEqual(s.semitone_transform("n0", -1)[0], "n11")
        self.assertEqual(s.semitone_transform("n0", -1)[1], -1)  # decrement octave
        self.assertEqual(s.semitone_transform("n0b", -1)[0], "n10")
        self.assertEqual(s.semitone_transform("n0b", -1)[1], -1)  # decrement octave
        self.assertEqual(s.semitone_transform("n1b", -1)[0], "n11")
        self.assertEqual(s.semitone_transform("n1b", -1)[1], -1)  # decrement octave
        self.assertEqual(s.semitone_transform("n11x", 1)[0], "n2")
        self.assertEqual(s.semitone_transform("n11x", 1)[1], 1)  # increment octave

        self.assertEqual(s._map_to_semitone_range(13, 0)[0], 1)

    def test_invert_even(self):
        s = Scale()
        self.assertEqual(s.invert("f", 5, "c", 5, "even")[0], "g")
        self.assertEqual(s.invert("f", 5, "c", 5, "even")[1], 4)
        self.assertEqual(s.invert("f", 4, "c", 5, "even")[1], 5)
        self.assertEqual(s.invert("d", 5, "c", 5, "even")[0], "a#")

    def test_invert_odd(self):
        s = Scale()
        self.assertEqual(s.invert("f", 5, "c", 5, "odd")[0], "g#")
        self.assertEqual(s.invert("d", 5, "c", 5, "odd")[0], "b")

    def test_invert_scalar(self):
        s = Scale()
        self.assertEqual(s.invert("f", 5, "c", 5, "scalar")[0], "g")
        self.assertEqual(s.invert("d", 5, "c", 5, "scalar")[0], "b")
        self.assertEqual(s.invert("g", 5, "c", 5, "scalar")[0], "f")
        self.assertEqual(s.invert("b", 5, "c", 5, "scalar")[0], "d")

    def test_chromatic_key_signature(self):
        ks = KeySignature(mode="chromatic", key="c")
        s = ks.get_scale()
        self.assertEqual(ks.get_mode_length(), 12)
        self.assertEqual(ks.get_number_of_semitones(), 12)
        self.assertEqual(s.scalar_transform("c", 2)[0], "d")
        self.assertEqual(s.scalar_transform("c#", 2)[0], "d#")
        self.assertEqual(s.semitone_transform("c", 2)[0], "d")
        self.assertEqual(s.semitone_transform("c#", 2)[0], "d#")
        self.assertEqual(s.semitone_transform("b", 1)[0], "c")
        self.assertEqual(s._map_to_scalar_range(13, 0)[0], 1)

    def test_third_comma_meantone_key_signature(self):
        t = Temperament(name="third comma meantone")
        ks = KeySignature(
            key="n0",
            number_of_semitones=t.get_number_of_semitones_in_octave(),
            mode=[2, 2, 1, 2, 2, 2, 7, 1],
        )
        s = ks.get_scale()
        self.assertEqual(ks.get_mode_length(), 8)
        self.assertEqual(ks.get_number_of_semitones(), 19)
        self.assertEqual(len(ks.get_notes_in_scale()), 8)
        self.assertEqual(ks.get_notes_in_scale()[7], "n18")
        self.assertEqual(s.closest_note("n12")[0], "n11")
        self.assertEqual(s.scalar_transform("n5", 2)[0], "n9")
        self.assertEqual(s.closest_note("n10#")[0], "n11")

    def test_mode_equivalents(self):
        ks = KeySignature(key="e", mode="major")
        s = ks.get_scale()
        source = ks.scale.normalize_scale(ks.notes_in_scale)
        ks = KeySignature(key="db", mode="minor")
        s = ks.get_scale()
        target = ks.scale.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="c#", mode="minor")
        s = ks.get_scale()
        target = ks.scale.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="eb", mode="locrian")
        s = ks.get_scale()
        target = ks.scale.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="d#", mode="locrian")
        s = ks.get_scale()
        target = ks.scale.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="b", mode="mixolydian")
        s = ks.get_scale()
        target = ks.scale.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="a", mode="lydian")
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="g#", mode="phrygian")
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="ab", mode="phrygian")
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="f#", mode="dorian")
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="gb", mode="dorian")
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))
        ks = KeySignature(key="e", mode=[2, 2, 1, 2, 2, 2, 1])
        s = ks.get_scale()
        target = s.normalize_scale(ks.notes_in_scale)
        self.assertTrue(compare_scales(source, target))

    def test_solfege_mapper(self):
        ks = KeySignature(key="c", mode="major")
        s = ks.get_scale()
        self.assertEqual(len(s.solfege_notes), 8)

        ks = KeySignature(key="c", mode="major pentatonic")
        s = ks.get_scale()
        self.assertEqual(len(s.solfege_notes), 6)
        self.assertEqual(s.solfege_notes[2], "me")
        self.assertEqual(s.solfege_notes[3], "sol")

        ks = KeySignature(key="c", mode="minor pentatonic")
        s = ks.get_scale()
        self.assertEqual(len(s.solfege_notes), 6)
        self.assertEqual(s.solfege_notes[2], "fa")
        self.assertEqual(s.solfege_notes[3], "sol")

        ks = KeySignature(key="c", mode="whole tone")
        s = ks.get_scale()
        self.assertEqual(len(s.solfege_notes), 7)
        self.assertEqual(s.solfege_notes[2], "me")
        self.assertEqual(s.solfege_notes[4], "sol")

        ks = KeySignature(key="c", mode="chromatic")
        s = ks.get_scale()
        self.assertEqual(len(s.solfege_notes), 13)
        self.assertEqual(s.solfege_notes[2], "re")
        self.assertEqual(s.solfege_notes[3], "meb")

    def test_convert_to_generic_note_name(self):
        s = Scale()
        self.assertEqual(s.convert_to_generic_note_name("g")[0], "n7")
        self.assertEqual(s.convert_to_generic_note_name("sol")[0], "n7")
        self.assertEqual(s.convert_to_generic_note_name("5")[0], "n7")
        self.assertEqual(s.convert_to_generic_note_name("pa")[0], "n7")
        self.assertEqual(s.convert_to_generic_note_name("g#")[0], "n8")
        self.assertEqual(s.convert_to_generic_note_name("sol#")[0], "n8")
        self.assertEqual(s.convert_to_generic_note_name("5#")[0], "n8")
        self.assertEqual(s.convert_to_generic_note_name("pa#")[0], "n8")

        self.assertEqual(s.name_converter("sol", s.solfege_notes), "n7")
        self.assertEqual(s.name_converter("pa", s.east_indian_solfege_notes), "n7")

        s.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )
        self.assertEqual(s.get_custom_note_names()[4], "golf")
        self.assertEqual(s.convert_to_generic_note_name("golf")[0], "n7")
        self.assertEqual(s.convert_to_generic_note_name("golf#")[0], "n8")

        self.assertEqual(s.semitone_transform("g", 3)[0], "a#")
        self.assertEqual(s.semitone_transform("n7", 3)[0], "n10")
        self.assertEqual(s.semitone_transform("sol", 3)[0], "tib")
        self.assertEqual(s.semitone_transform("5", 3)[0], "7b")
        self.assertEqual(s.semitone_transform("pa", 3)[0], "nib")
        self.assertEqual(s.semitone_transform("golf", 3)[0], "n10")

    def test_type_conversion(self):
        s = Scale()
        s.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )

        self.assertEqual(s.generic_note_name_convert_to_type("n7", LETTER_NAME), "g")
        self.assertEqual(s.generic_note_name_convert_to_type("n7", SOLFEGE_NAME), "sol")
        self.assertEqual(
            s.generic_note_name_convert_to_type("n8", SOLFEGE_NAME), "sol#"
        )
        self.assertEqual(s.generic_note_name_convert_to_type("n9", SOLFEGE_NAME), "la")
        self.assertEqual(
            s.generic_note_name_convert_to_type("n7", EAST_INDIAN_SOLFEGE_NAME),
            "pa",
        )
        self.assertEqual(
            s.generic_note_name_convert_to_type("n7", SCALAR_MODE_NUMBER), "5"
        )
        self.assertEqual(s.generic_note_name_convert_to_type("n7", CUSTOM_NAME), "golf")

    def test_restore_format(self):
        s = Scale()
        self.assertEqual(s._restore_format("n7", SOLFEGE_NAME, True), "sol")
        self.assertEqual(s._restore_format("n8", SOLFEGE_NAME, True), "sol#")
        self.assertEqual(s._restore_format("n8", SOLFEGE_NAME, False), "lab")

        self.assertEqual(s._pitch_to_note_number("a", 4), 57)

        # Modal pitch starts at 0
        self.assertEqual(s.modal_pitch_to_letter(4)[0], "g")

    def test_pitch_type_check(self):
        s = Scale()
        s.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )

        self.assertEqual(s.pitch_name_type("g"), LETTER_NAME)
        self.assertEqual(s.pitch_name_type("c#"), LETTER_NAME)
        self.assertEqual(s.pitch_name_type("n7"), GENERIC_NOTE_NAME)
        self.assertEqual(s.pitch_name_type("n7b"), GENERIC_NOTE_NAME)
        self.assertEqual(s.pitch_name_type("sol"), SOLFEGE_NAME)
        self.assertEqual(s.pitch_name_type("sol#"), SOLFEGE_NAME)
        self.assertEqual(s.pitch_name_type("pa"), EAST_INDIAN_SOLFEGE_NAME)
        self.assertEqual(s.pitch_name_type("5"), SCALAR_MODE_NUMBER)
        self.assertEqual(s.pitch_name_type("golf"), CUSTOM_NAME)
        self.assertEqual(s._generic_note_name_to_custom_note_name("n7")[0], "golf")
        self.assertEqual(s.pitch_name_type("foobar"), UNKNOWN_PITCH_NAME)

        self.assertEqual(get_pitch_type("g"), LETTER_NAME)
        self.assertEqual(get_pitch_type("c#"), LETTER_NAME)
        self.assertEqual(get_pitch_type("n7"), GENERIC_NOTE_NAME)
        self.assertEqual(get_pitch_type("n7b"), GENERIC_NOTE_NAME)
        self.assertEqual(get_pitch_type("sol"), SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("sol#"), SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("pa"), EAST_INDIAN_SOLFEGE_NAME)
        self.assertEqual(get_pitch_type("5"), SCALAR_MODE_NUMBER)
        self.assertEqual(get_pitch_type("foobar"), UNKNOWN_PITCH_NAME)

    def test_fixed_solfege(self):
        ks = KeySignature(key="g", mode="major")
        s = ks.get_scale()
        self.assertEqual(s.generic_note_name_convert_to_type("n7", SOLFEGE_NAME), "sol")
        self.assertEqual(s.convert_to_generic_note_name("sol")[0], "n7")
        s.set_fixed_solfege(True)
        self.assertTrue(s.get_fixed_solfege())

        self.assertEqual(s.generic_note_name_convert_to_type("n7", SOLFEGE_NAME), "do")
        self.assertEqual(s.convert_to_generic_note_name("do")[0], "n7")
        self.assertEqual(
            s._generic_note_name_to_letter_name("n6", prefer_sharps=True)[0],
            "f#",
        )
        self.assertEqual(
            s._generic_note_name_to_solfege("n6", prefer_sharps=True)[0], "ti"
        )
        self.assertEqual(s._convert_from_note_name("n7", s.solfege_notes)[0], "do")
        self.assertEqual(s._generic_note_name_to_east_indian_solfege("n7")[0], "sa")
        self.assertEqual(s._generic_note_name_to_scalar_mode_number("n7")[0], "1")

    def test_get_frequency(self):
        t = Temperament()
        s = Scale()
        self.assertEqual(
            int(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("a")[0], 4
                )
                + 0.5
            ),
            440,
        )

    def test_frequency_conversion(self):
        t = Temperament()
        s = Scale()
        s.set_custom_note_names(
            ["charlie", "delta", "echo", "foxtrot", "golf", "alfa", "bravo"]
        )

        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("g")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("sol")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("5")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("pa")[0], 4
                ),
                100,
            ),
            392.0,
        )
        self.assertEqual(
            round(
                t.get_freq_by_generic_note_name_and_octave(
                    s.convert_to_generic_note_name("golf")[0], 4
                ),
                100,
            ),
            392.0,
        )

    def test_meantone_scales(self):
        ks = KeySignature(mode=[], number_of_semitones=21)
        s = ks.get_scale()
        self.assertEqual(ks.get_mode_length(), 21)
        self.assertEqual(ks.get_number_of_semitones(), 21)
        self.assertEqual(s.closest_note("cb")[0], "cb")
        self.assertEqual(s.semitone_transform("gb", 1)[0], "g")
        self.assertEqual(s.semitone_transform("cb", 3)[0], "d")
        self.assertEqual(s.semitone_transform("c", -3)[0], "bb")

        ks = KeySignature(mode=[3, 3, 3, 3, 3, 3, 3], number_of_semitones=21)
        s = ks.get_scale()
        self.assertEqual(s.closest_note("cb")[0], "c")
        self.assertEqual(s.closest_note("db")[0], "d")
        self.assertEqual(s.closest_note("c#")[0], "c")
        self.assertEqual(s.scalar_transform("c", 1)[0], "d")

        ks = KeySignature(number_of_semitones=21)
        s = ks.get_scale()
        self.assertEqual(s.closest_note("cb")[0], "c")
        self.assertEqual(s.closest_note("db")[0], "d")
        self.assertEqual(s.closest_note("c#")[0], "c")
        self.assertEqual(s.scalar_transform("c", 1)[0], "d")

        ks = KeySignature(key="bb", mode="lydian", number_of_semitones=21)
        s = ks.get_scale()
        self.assertEqual(s.closest_note("bb")[0], "bb")
        self.assertEqual(s.closest_note("n18")[0], "n17")

    def print_scales(self):
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
