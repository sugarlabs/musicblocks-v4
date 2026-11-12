/**
 * Per-program musical state that the runtime owns.
 *
 * Held as primitive descriptors rather than live singer objects, so this layer stays free of the
 * singer library. The descriptors are turned into singer `KeySignature` and `Temperament` objects
 * when a note is resolved to a frequency (at event generation time), not here.
 *
 * One context lives on the execution context today. It is shaped to move onto a per-thread object
 * unchanged once the interpreter runs more than one voice.
 */
export interface MusicContext {
    /** Tonic of the current key, as a lowercase pitch letter, e.g. `c`. */
    key: string;
    /** Mode name, e.g. `major`. */
    mode: string;
    /** When true, solfege is read movable-do relative to the key; when false, fixed-do. */
    movableDo: boolean;
    /** Temperament name, e.g. `equal`. */
    temperament: string;
    /** Default octave for a pitch written without one. */
    octave: number;
    /** Playback volume, 0 to 100. */
    volume: number;
    /** Instrument name used for playback. */
    instrument: string;
}

/**
 * The starting music context. These defaults match the runtime's current hardcoded playback
 * (C major, equal temperament, A440), so attaching a context changes nothing that runs today.
 */
export function defaultMusicContext(): MusicContext {
    return {
        key: 'c',
        mode: 'major',
        movableDo: false,
        temperament: 'equal',
        octave: 4,
        volume: 50,
        instrument: 'electronic synth',
    };
}
