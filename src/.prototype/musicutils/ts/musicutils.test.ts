import {
    stripAccidental,
    normalizePitch,
    displayPitch,
    isASharp,
    findSharpIndex,
    isAFlat,
    findFlatIndex,
    getPitchType
} from './musicutils';

describe('Music utilities', () => {
    describe('Validate stripAccidental', () => {
        test('Strip accidental on pitch gbb and expect pitch g with -2 change in half steps', () => {
            expect(stripAccidental('gbb')).toEqual(['g', -2]);
        });

        test('Strip accidental on pitch d𝄫 and expect pitch d with -2 change in half steps', () => {
            expect(stripAccidental('d𝄫')).toEqual(['d', -2]);
        });

        test('Strip accidental on pitch c♭ and expect pitch c with -1 change in half steps', () => {
            expect(stripAccidental('c♭')).toEqual(['c', -1]);
        });

        test('Strip accidental on pitch a♯ and expect pitch a with +1 change in half steps', () => {
            expect(stripAccidental('a♯')).toEqual(['a', 1]);
        });

        test('Strip accidental on pitch b♮ and expect pitch b with 0 change in half steps', () => {
            expect(stripAccidental('b♮')).toEqual(['b', 0]);
        });
    });

    describe('Validate normalizePitch', () => {
        test('Normalize pitch C♭ and expect to be cb', () => {
            expect(normalizePitch('C♭')).toBe('cb');
        });

        test('Normalize pitch C♯ and expect to be c#', () => {
            expect(normalizePitch('C♯')).toBe('c#');
        });

        test('Normalize pitch C♮ and expect to be c', () => {
            expect(normalizePitch('C♮')).toBe('c');
        });

        test('Normalize pitch C𝄫 and expect to be cbb', () => {
            expect(normalizePitch('C𝄫')).toBe('cbb');
        });
    });

    describe('Validate displayPitch', () => {
        test('Pretty print cb and expect to be C♭', () => {
            expect(displayPitch('cb')).toBe('C♭');
        });

        test('Pretty print d# and expect to be D♯', () => {
            expect(displayPitch('d#')).toBe('D♯');
        });

        test('Pretty print dbb and expect to be D𝄫', () => {
            expect(displayPitch('dbb')).toBe('D𝄫');
        });
    });

    describe('Validate isASharp', () => {
        test('Test c# and expect it to be a sharp pitch', () => {
            expect(isASharp('c#')).toBe(true);
        });

        test('Test g and expect it to be a sharp pitch', () => {
            expect(isASharp('g')).toBe(true);
        });

        test('Test bb and expect it to not be a sharp pitch', () => {
            expect(isASharp('bb')).toBe(false);
        });
    });

    describe('Validate findSharpIndex', () => {
        test('Generate index of sharp in pitch d# and expect 3', () => {
            expect(findSharpIndex('d#')).toEqual(3);
        });

        test('Generate index of sharp in pitch c# and expect 1', () => {
            expect(findSharpIndex('c#')).toEqual(1);
        });

        test('Generate index of sharp in pitch gx and expect 9', () => {
            expect(findSharpIndex('gx')).toEqual(9);
        });
    });

    describe('Validate isAFlat', () => {
        test('Test bb and expect it to be a flat pitch', () => {
            expect(isAFlat('bb')).toBe(true);
        });

        test('Test g and expect it to be a flat pitch', () => {
            expect(isAFlat('g')).toBe(true);
        });

        test('Test c# and expect it to not be a flat pitch', () => {
            expect(isAFlat('c#')).toBe(false);
        });

        test('Test a# and expect it to not be a flat pitch', () => {
            expect(isAFlat('a#')).toBe(false);
        });
    });

    describe('Validate findFlatIndex', () => {
        test('Generate index of flat in pitch db and expect 1', () => {
            expect(findFlatIndex('db')).toBe(1);
        });

        test('Generate index of sharp in pitch bbb and expect 9', () => {
            expect(findFlatIndex('bbb')).toBe(9);
        });

        test('Generate index of sharp in pitch gbb and expect 5', () => {
            expect(findFlatIndex('gbb')).toBe(5);
        });
    });

    describe('Validate getPitchType', () => {
        test("Generate pitch type of pitch bb and expect 'letter name'", () => {
            expect(getPitchType('bb')).toBe('letter name');
        });

        test("Generate pitch type of pitch do and expect 'solfege name'", () => {
            expect(getPitchType('do')).toBe('solfege name');
        });

        test("Generate pitch type of pitch dha and expect 'east indian solfege name'", () => {
            expect(getPitchType('dha')).toBe('east indian solfege name');
        });

        test("Generate pitch type of pitch aaa and expect 'uknown'", () => {
            expect(getPitchType('aaa')).toBe('unknown');
        });
    });
});
