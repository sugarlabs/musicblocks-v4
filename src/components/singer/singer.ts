import * as Tone from 'tone';

// -- private variables ----------------------------------------------------------------------------

/** Default state parameter values of a synth. */
const _defaultSynthStateValues = {
    // startTime: new Date().getTime(),
    notesPlayed: 0,
    beat: 1 / 4,
    beatsPerMinute: 90,
};

import KeySignature from './core/keySignature';

const testKeySignature = new KeySignature('major', 'c');

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
export class ElementTestSynth extends ElementStatement {
    constructor() {
        super('test-synth', 'test synth', { pitch: ['number', 'string'], noteValue: ['number'] });
    }

    /**
     * Plays a predefined note.
     */
    onVisit(params: { [key: string]: TData }): void {
        const now = Tone.now();
        const noteValue = params['noteValue'] as number;
        const offset = noteValueToSeconds(_state.notesPlayed);
        if (typeof params['pitch'] === 'number') {
            let note = testKeySignature.modalPitchToLetter((params['pitch'] as number) - 1);
            _defaultSynth.triggerAttackRelease(
                note[0] + (4 + note[1]),
                noteValue + 'n',
                now + offset,
            );
        } else {
            _defaultSynth.triggerAttackRelease(
                params['pitch'] as string,
                noteValue + 'n',
                now + offset,
            );
        }
        _state.notesPlayed += 1 / noteValue;
    }
}

export class ElementPlayNote extends ElementStatement {
    constructor() {
        super('play-note', 'play note', {
            /*octave: ['number', 'string']*/ pitch: ['number'],
            duration: ['number'],
        });
        // super('test-synth', 'test synth', {});
    }

    /**
     * Plays a user inputted note.
     */
    onVisit(params: { [key: string]: TData }): void {
        // onVisit(): void {
        const duration = params['duration'] as number;
        const now = Tone.now();
        const noteValue = duration + 'n'; //making the duration a string
        const offset = noteValueToSeconds(_state.notesPlayed);
        const noteTup = testKeySignature.modalPitchToLetter((params['pitch'] as number) - 1); //getting the note from a list in keySignature.ts
        const fullNote = noteTup[0] + /*params['octave'] as number*/ (4 + noteTup[1]); //adding the octave (in this case 4) to the note
        _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset); //playing the note
        console.log('noteTup', noteTup, 'fullNote', fullNote); //printing out the note
        _state.notesPlayed += 1 / duration;
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
