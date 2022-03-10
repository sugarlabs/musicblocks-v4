import * as Tone from 'tone';

// -- private variables ----------------------------------------------------------------------------

/** Default state parameter values of a synth. */
const _defaultSynthStateValues = {
    // startTime: new Date().getTime(),
    notesPlayed: 0,
    beat: 1/4,
    beatsPerMinute: 90,
};

const numToNoteChromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/** Synth state parameters. */
const _stateObj = { ..._defaultSynthStateValues };

/** Proxy to the synth state parameters. */
const _state = new Proxy(_stateObj, {
    set: (_, key, value) => {
        if (key === 'beatsPerMinute') {
            _stateObj.beatsPerMinute = value;
        } else if (key === 'beat') {
            _stateObj.beat = value;
        } else if (key === 'notesPlayed') {
            _stateObj.notesPlayed = value;
        }
        return true;
    },
});

/** Default synth **/
const _defaultSynth = new Tone.Synth().toDestination();


// -- private functions ----------------------------------------------------------------------------

/**
 * Convert from note value to seconds
 * @param noteValue - 1/4, 1/8 etc.
 **/
export function noteValueToSeconds(noteValue: number): number {
    return (60 / _state.beatsPerMinute) * (noteValue / _state.beat);
}



// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the Singer component.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        resolve();
    });
}

// -- public classes -------------------------------------------------------------------------------

import { ElementStatement, TData } from '@sugarlabs/musicblocks-v4-lib';

/**
 * @class
 * Defines a `music` statement element that tests the synth.
 */
export class ElementTestSynthChromatic extends ElementStatement {
    constructor() {
        super('test-synth-chromatic', 'test synth chromatic', { octave: ['number'/*, 'string'*/], note: ['number']/*, duration: ['number']*/});
        // super('test-synth', 'test synth', {});
    }

    /**
     * Plays a predefined note.
     */
    onVisit(params: { [key: string]: TData }): void {
    // onVisit(): void {
        const now = Tone.now();
    	const noteValue = "4n"; //params['duration'] as number + "n";
        const offset = noteValueToSeconds(_state.notesPlayed);
	/*if (typeof params['pitch'] === 'number') {
            _defaultSynth.triggerAttackRelease(params['pitch'], noteValue + "n", now + offset);
        } else {
            _defaultSynth.triggerAttackRelease(params['pitch'] as string, noteValue + "n", now + offset);
        }
	_state.notesPlayed += 1/noteValue;*/
        // _defaultSynth.triggerAttackRelease("C4", "8n", now + offset);
        const fullNote = numToNoteChromatic[params['note'] as number - 1] + params['octave'] as string;
        _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
        _state.notesPlayed += 1/4;
    }
}

/**
 * @class
 * Defines a `music` statement element that tests the synth.
 */
export class ElementResetNotesPlayed extends ElementStatement {
    constructor() {
        super('reset-notes-played', 'reset', {});
    }

    /**
     * Resets notesPlayed counter to 0
     */
    onVisit(): void {
	_state.notesPlayed = 0;
    }
}
