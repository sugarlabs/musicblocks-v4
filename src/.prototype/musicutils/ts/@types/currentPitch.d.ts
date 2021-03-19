export default interface ICurrentPitch {
    readonly freq: number; // get
    readonly number: number; // get
    readonly octave: number; // get
    readonly genericName: string; // get
    readonly semitoneIndex: number; // get

    setPitch: (pitchName: number | string, octave: number) => void;
    applySemitoneTransposition: (numberOfHalfSteps: number) => void;
    applyScalarTransposition: (numberOfScalarSteps: number) => void;
    getSemitoneInterval: (numberOfHalfSteps: number) => number;
    getScalarInterval: (numberOfScalarSteps: number) => number;
}
