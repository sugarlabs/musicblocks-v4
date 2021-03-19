import { Scale } from './scale';

describe('class Scale', () => {
    describe('Validate scale generation', () => {
        const sCMaj = new Scale([2, 2, 1, 2, 2, 2, 1], 0);
        test('Generate scale for C Major and verify', () => {
            expect(sCMaj.getScale()).toEqual(['n0', 'n2', 'n4', 'n5', 'n7', 'n9', 'n11', 'n0']);
        });

        test('Generate scale for C Major with pitch format and verify', () => {
            expect(
                sCMaj.getScale(['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'])
            ).toEqual(['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c']);
        });

        const sGMaj = new Scale([2, 2, 1, 2, 2, 2, 1], 7);
        test('Generate scale for G Major and verify', () => {
            expect(sGMaj.getScale()).toEqual(['n7', 'n9', 'n11', 'n0', 'n2', 'n4', 'n6', 'n7']);
        });

        test('Expect octave delta of 4th note in the G Major scale to be 1', () => {
            expect(sGMaj.getScaleAndOctaveDeltas()[1][3]).toBe(1);
        });
    });
});
