/**
 * A note resolved to a frequency at event-generation time.
 *
 * It carries both the frequency, which playback needs, and the symbolic form, which notation
 * export needs later. Timing (when the note starts) is added by the engine, not here.
 */
export interface NoteEvent {
    /** Frequency in hertz. */
    hz: number;
    /** Generic note name from singer, e.g. `n9`. */
    name: string;
    /** Octave the note resolved to. */
    octave: number;
    /** Offset in cents from the named pitch. */
    cents: number;
    /** Duration in beats. */
    durationBeats: number;
    /** Instrument used for playback. */
    instrument: string;
    /** Volume, 0 to 100. */
    volume: number;
}
