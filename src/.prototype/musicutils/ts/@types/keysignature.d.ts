export interface IKeySignature {
    key: string;
    mode: string;
    scale: string[];
    halfSteps: number[];
    keySignature: string;
    genericScale: string[];
    scalarModeNumbers: string[];
    eastIndianSolfegeNotes: string[];

    fixedSolfege: boolean;
    customNoteNames: string[]; // get set

    readonly modeLength: number;
    readonly solfegeNotes: string[];
    readonly numberOfSemitones: number;

    get_scale: () => string[];
    noteInScale: (target: string) => boolean;
    pitchNameType: (pitchName: string) => string;
    normalizeScale: (scale: string[]) => string[];
    modalPitchToLetter: (modalIndex: number) => [string, number];
    convertToGenericNoteName: (pitchName: string) => [string, number];
    toString: () => string;
    semitoneTransform: (
        startingPitch: string,
        numberOfHalfSteps: number
    ) => [string, number, number];
    scalarTransform: (
        startingPitch: string,
        numberOfScalarSteps: number
    ) => [string, number, number];
    genericNoteNameConvertToType: (
        pitchName: string,
        targetType: string,
        preferSharps: boolean
    ) => string;
    scalarDistance: (
        pitchA: string,
        octaveA: number,
        pitchB: string,
        octaveB: number
    ) => [number, number];
    invert: (
        pitchName: string,
        octave: number,
        invertPointPitch: string,
        invertPointOctave: number,
        invertMode: string
    ) => [string, number];
    closestNote: (target: string) => [string, number, number, number];
    semitoneDistance: (pitchA: string, octaveA: number, pitchB: string, octaveB: number) => number;
}
