export interface IScale {
    /**
     * Getter that returns the number of notes in the scale.
     * @readonly
     * */
    numberOfSemitones: number;
    /**
     * Getter that returns the notes defined by the temperament.
     * @readonly
     */
    noteNames: string[];
    /**
     * Returns the notes in the scale.
     * @throws {FormatMismatchError}
     */
    getScale: (pitchFormat?: string[]) => string[];
    /**
     * Returns the notes in the scale and the octave deltas.
     * @throws {FormatMismatchError}
     */
    getScaleAndOctaveDeltas: (pitchFormat?: string[]) => [string[], number[]];
}
