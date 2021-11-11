/**
 * @class
 * Class representing the singer component.
 */
export default class {
    // parameter used by pitch
    private _scalarTransposition = 0;
    private _transposition = 0;

    // parameter used by notes
    private _noteValue = {};
    private _noteBeat = {};
    private _noteDrums = {};
    private _notePitches = {};
    private _noteOctaves = {};
    private _lastNotePlayed = null;
    private _lastPitchPlayed = {};
    private _currentOctave = 4;
    private _noteDirection = 0;

    // Music related parameter

    private _notesPlayed = [0, 1];
    private _tallyNotes = 0;

    // Effect parameter
    private _vibratoIntensity = [];
    private _vibratoRate = [];
    private _distortionAmount = [];
    private _tremoloFrequency = [];
    private _tremoloDepth = [];
    private _rate = [];
    private _octaves = [];
    private _baseFrequency = [];
    private _chorusRate = [];
    private _delayTime = [];
    private _chorusDepth = [];

    // parameter to count notes, measure intervals, or generate lilypond output
    private _justCounting = [];
    private _justMeasuring = [];
    private _firstPitch = [];
    private _lastPitch = [];
    private _suppressOutput = false;

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

    // ============ Private helper functions ===============================================
    // These functions will be used by playPitch and playNote function
}
