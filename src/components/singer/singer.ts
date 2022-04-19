import * as Tone from 'tone';

// -- private variables ----------------------------------------------------------------------------

/** Default state parameter values of a synth. */
const _defaultSynthStateValues = {
    // startTime: new Date().getTime(),
    notesPlayed: 0,
    beat: 1 / 4,
    beatsPerMinute: 90,
};

// const chromaticNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

import KeySignature from './core/keySignature';
import { LETTER_NAME } from './core/musicUtils';

const testKeySignature = new KeySignature('major', 'c');
console.log(
    'key:',
    testKeySignature.key,
    'keySignature:',
    testKeySignature.keySignature,
    'mode:',
    testKeySignature.mode,
    'scale:',
    testKeySignature.scale,
    'solfegeNotes:',
    testKeySignature.solfegeNotes,
);

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
        super('test-synth-chromatic', 'test synth chromatic', {
            octave: ['number' /*, 'string'*/],
            note: ['number'] /*, duration: ['number']*/,
        });
        // super('test-synth', 'test synth', {});
    }

    /**
     * Plays a predefined note.
     */
    onVisit(params: { [key: string]: TData }): void {
        // onVisit(): void {
        const now = Tone.now();
        const noteValue = '4n'; //params['duration'] as number + "n";
        const offset = noteValueToSeconds(_state.notesPlayed);
        const noteTup = testKeySignature.modalPitchToLetter((params['note'] as number) - 1);
        const fullNote = noteTup[0] + ((params['octave'] as number) + noteTup[1]);
        _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
        console.log('noteTup', noteTup, 'fullNote', fullNote);
        _state.notesPlayed += 1 / 4;
    }
}

export class ElementTestSynth extends ElementStatement {
    constructor() {
        super('test-synth', 'test synth', { mode: ['number'] });
    }
    onVisit(params: { [key: string]: TData }): void {
        // onVisit(): void {
        const noteValue = '8n'; //params['duration'] as number + "n";
        if ((params['mode'] as number) === 1) {
            for (let modalPitch = 1; modalPitch <= testKeySignature.modeLength; modalPitch++) {
                const now = Tone.now();
                const offset = noteValueToSeconds(_state.notesPlayed);
                const noteTup = testKeySignature.modalPitchToLetter(modalPitch - 1);
                const fullNote = noteTup[0] + (4 + noteTup[1]);
                _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
                console.log('noteTup', noteTup, 'fullNote', fullNote);
                _state.notesPlayed += 1 / 8;
            }
        } else if ((params['mode'] as number) === 2) {
            testKeySignature.solfegeNotes.forEach((name) => {
                const now = Tone.now();
                const offset = noteValueToSeconds(_state.notesPlayed);
                const note = testKeySignature.genericNoteNameConvertToType(
                    testKeySignature.convertToGenericNoteName(name),
                    LETTER_NAME,
                );
                const fullNote = note + 4;
                _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
                console.log('note', note, 'fullNote', fullNote);
                _state.notesPlayed += 1 / 8;
            });
        }
    }
}

//the basic music construct
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
