import Temperament from './temperament';

describe('class Temperament', () => {
    describe('Temperament generation', () => {
        test("Generate 'equal 12' temperament instance and verify members", () => {
            const t = new Temperament();
            expect(t.name).toBe('equal');

            t.baseFrequency = Temperament.C0;
            expect(t.baseFrequency).toBe(Temperament.C0);
            expect(t.numberOfOctaves).toBe(8);

            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.0);
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'pythagorean' temperament instance and verify frequencies", () => {
            const t = new Temperament('pythagorean');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(55.19); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'just intonation' temperament instance and verify frequencies", () => {
            const t = new Temperament('just intonation');
            const f: number[] = t.freqs;
            expect(Number(f[21].toFixed(2))).toBe(54.51); // A1
            expect(t.noteNames.length).toBe(12);
        });

        test("Generate 'quarter comma meantone' temperament instance and verify frequencies", () => {
            const t = new Temperament('quarter comma meantone');
            const f: number[] = t.freqs;
            expect(Number(f[36].toFixed(2))).toBe(55.45); // A1
            expect(t.noteNames.length).toBe(21);
        });

        test("Generate 'equal 24' temperament instance and verify frequencies", () => {
            const t = new Temperament();
            t.generateEqualTemperament(24);
            const f: number[] = t.freqs;
            expect(Number(f[42].toFixed(2))).toBe(55.0); // A1
            expect(t.noteNames.length).toBe(24);
        });
    });

    describe('Tuning', () => {
        const t = new Temperament();

        test('Tune A4 to 440 Hz and expect 58th frequency to be 440Hz C0 (1st) to be 16.35 Hz', () => {
            t.tune('a', 4, 440.0);
            expect(Number(t.freqs[57].toFixed(2))).toBe(440.0);
            expect(Number(t.baseFrequency.toFixed(2))).toBe(16.35);
        });

        test('Tune A4 to 441 Hz and expect C0 to be 16.39 Hz', () => {
            t.tune('a', 4, 441.0);
            expect(Number(t.baseFrequency.toFixed(2))).toBe(16.39);
            expect(Number(t.freqs[57].toFixed(2))).toBe(441.0);
        });
    });
});
