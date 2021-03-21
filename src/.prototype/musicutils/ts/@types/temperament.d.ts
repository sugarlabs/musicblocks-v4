export interface ITemperament {
    C0: number;
    intervals: Array<string>;
    ratios: { [key: string]: number };

    baseFrequency: number; // get set
    numberOfOctaves: number; // get set

    readonly name: string; // get
    readonly freqs: Array<number>; // get
    readonly noteNames: Array<string>; // get
    readonly numberOfSemitonesInOctave: number; // get
    readonly numberOfNotesInTemperament: number; // get

    generate: (name: string) => void;
    getModalIndex: (noteName: string) => number;
    getNoteName: (semitoneIndex: number) => string;
    getFreqByIndex: (pitchIndex: number) => number;
    getNearestFreqIndex: (target: number) => number;
    generateEqualTemperament: (numberOfSteps: number) => void;
    tune: (pitchNameArg: string, octave: number, frequency: number) => number;
    getGenericNoteNameAndOctaveByFreqIndex: (idx: number) => [string, number];
    getModalIndexAndOctaveFromFreqIndex: (pitchIndex: number) => Array<number>;
    getFreqByModalIndexAndOctave: (modalIndex: number, octave: number) => number;
    getFreqByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;
    getFreqIndexByGenericNoteNameAndOctave: (noteName: string, octave: number) => number;
    generateCustom: (
        intervals: Array<string>,
        ratios: { [key: string]: number },
        name: string
    ) => void;
}
