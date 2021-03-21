/*
    Unit tests for musicutils
*/

// Copyright 2021 Walter Bender, Sugar Labs

// This program is free software; you can redistribute it and/or
// modify it under the terms of the The GNU Affero General Public
// License as published by the Free Software Foundation; either
// version 3 of the License, or (at your option) any later version.

// You should have received a copy of the GNU Affero General Public
// License along with this library; if not, write to the Free Software
// Foundation, 51 Franklin Street, Suite 500 Boston, MA 02110-1335 USA

import { Temperament } from './temperament';

describe('Temperament Tests', () => {
    test('equal 12', () => {
        const t = new Temperament();
        expect(t.name).toBe('equal');
        t.baseFrequency = t.C0;
        expect(t.baseFrequency).toBe(t.C0);
        expect(t.numberOfOctaves).toBe(8);
        const f: Array<number> = t.freqs;
        expect(Number(f[21].toFixed(2))).toBe(55.0);
        expect(t.noteNames.length).toBe(12);
    });
    test('pythagorean', () => {
        const t = new Temperament('pythagorean');
        const f: Array<number> = t.freqs;
        expect(Number(f[21].toFixed(2))).toBe(55.19); // A1
        expect(t.noteNames.length).toBe(12);
    });
    test('just intonation', () => {
        const t = new Temperament('just intonation');
        const f: Array<number> = t.freqs;
        expect(Number(f[21].toFixed(2))).toBe(54.51); // A1
        expect(t.noteNames.length).toBe(12);
    });
    test('quarter comma meantone', () => {
        const t = new Temperament('quarter comma meantone');
        const f: Array<number> = t.freqs;
        expect(Number(f[36].toFixed(2))).toBe(55.45); // A1
        expect(t.noteNames.length).toBe(21);
    });
    test('equal 24', () => {
        const t = new Temperament();
        t.generateEqualTemperament(24);
        const f: Array<number> = t.freqs;
        expect(Number(f[42].toFixed(2))).toBe(55.0); // A1
        expect(t.noteNames.length).toBe(24);
    });
    test('test tuning', () => {
        const t = new Temperament();
        t.tune('a', 4, 440.0);
        expect(Number(t.baseFrequency.toFixed(2))).toBe(16.35);
        t.tune('a', 4, 441.0);
        expect(Number(t.baseFrequency.toFixed(2))).toBe(16.39);
        expect(Number(t.freqs[57].toFixed(2))).toBe(441.0);
    });
});
