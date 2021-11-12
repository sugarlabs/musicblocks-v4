/**
 * @class
 * Class representing the singer component.
 */
export default class {
    // parameter used by pitch
    public _scalarTransposition = 0;
    public _transposition = 0;

    // parameter used by notes
    public _noteValue = {};
    public _noteBeat = {};
    public _noteDrums = {};
    public _notePitches = {};
    public _noteOctaves = {};
    public _lastNotePlayed = null;
    public _lastPitchPlayed = {};
    public _currentOctave = 4;
    public _noteDirection = 0;

    // Music related parameter

    public _notesPlayed = [0, 1];
    public _tallyNotes = 0;

    // Effect parameter
    public _vibratoIntensity = [];
    public _vibratoRate = [];
    public _distortionAmount = [];
    public _tremoloFrequency = [];
    public _tremoloDepth = [];
    public _rate = [];
    public _octaves = [];
    public _baseFrequency = [];
    public _chorusRate = [];
    public _delayTime = [];
    public _chorusDepth = [];

    // parameter to count notes, measure intervals, or generate lilypond output
    public _justCounting = [];
    public _justMeasuring = [];
    public _firstPitch = [];
    public _lastPitch = [];
    public _suppressOutput = false;
    // ============ Contructor ================================================
    constructor() {
        // Initialise variables
    }
    // ============ Utilties ==================================================
    /**
     * Sets the master volume to a value of at least 0 and at most 100
     * @param {number} Volume - master volume to be set.
     */
    public setMasterVolume(volume: number): void {
        volume = Math.min(Math.max(volume, 0), 100);
    }
    /**
     * Sets valume of individual sprites to a value of at least 0 and at most 100
     * @param {number} Volume - sprite volume of be set.
     */
    public setSpriteVolume(volume: number): void {
        volume = Math.min(Math.max(volume, 0), 100);
    }
    /**
     * Calculate the change needed for musical Inversion
     * @param {string} note : the note to be inversed
     * @param {number} octave : the octave to be inversed
     * @returns {string} inverted value
     */
    public calculateInvert(note: string, octave: number): number {
        return 0;
    }
    /**
     * Return the distance for scalar transposition.
     * @param firstNote
     * @param lastNote
     * @returns scalar distance
     */
    public scalarDistance(firstNote: number, lastNote: number): number {
        return 0;
    }
    /**
     * Shifts pitches by n steps relative to the provided scale.
     * @param {string} note
     * @param {number} octave
     * @param {number} steps - number of steps to shift
     * @returns {[String, Number]} transposed note and octave
     */
    public addScalarTransposition(note: string, octave: number, steps: number): [string, number] {
        return [note, octave];
    }
    /**
     * Number of tally notes inside a clamp
     */
    public numberOfNotes(): number {
        return 0;
    }

    // ============ Action ===============================================
    /**
     * processing a pitch
     * @param {string} note - note value
     * @param {number} octave - scale
     */
    public processPitch(note: string, octave: number): void {
        // prcoess the pitch
    }

    /**
     * Playing a note
     * @param {string} note - note to be played
     */
    public playNote(note: string): void {
        // Play the note
    }
}
