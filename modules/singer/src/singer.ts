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
import CurrentPitch from './core/currentPitch';
import Temperament from './core/temperament';

import { SCALAR_MODE_NUMBER } from './core/musicUtils';

const testKeySignature = new KeySignature('major', 'd');
const currentpitch = new CurrentPitch(testKeySignature, new Temperament(), 1, 4);

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
/** Poly synth **/
const _polySynth = new Tone.PolySynth().toDestination();

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
        super('test-synth', 'test synth', { mode: ['number'] });
    }
    onVisit(params: { [key: string]: TData }): void {
        // onVisit(): void {
        const noteValue = '8n'; //params['duration'] as number + "n";
        if ((params['mode'] as number) === 1) {
            for (let modalPitch = 1; modalPitch <= testKeySignature.modeLength + 1; modalPitch++) {
                const now = Tone.now();
                const offset = noteValueToSeconds(_state.notesPlayed);
                const noteTup = testKeySignature.modalPitchToLetter(modalPitch - 1);
                let octave = currentpitch.octave;
                const fullNote = noteTup[0] + (octave + noteTup[1]);
                _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
                console.log('noteTup', noteTup, 'fullNote', fullNote);
                octave += noteTup[1];
                console.log('octave', octave);
                _state.notesPlayed += 1 / 8;
            }
        } else if ((params['mode'] as number) === 2) {
            for (let i = 0; i < 8; i++) {
                const now = Tone.now();
                const offset = noteValueToSeconds(_state.notesPlayed);
                let note = testKeySignature.modalPitchToLetter(
                    parseInt(
                        testKeySignature.genericNoteNameConvertToType(
                            currentpitch._genericName,
                            SCALAR_MODE_NUMBER,
                        ),
                    ) - 1,
                );
                const fullNote = note[0] + currentpitch.octave;
                _defaultSynth.triggerAttackRelease(fullNote, noteValue, now + offset);
                console.log('fullNote:', fullNote, 'noteTup:', note);
                _state.notesPlayed += 1 / 8;
                currentpitch.applyScalarTransposition(1);
            }
        }
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

export class PlayGenericNoteName extends ElementStatement {
    constructor() {
        super('play-generic', 'play generic', { name: ['string'] });
    }

    onVisit(params: { [key: string]: TData }): void {
        const now = Tone.now();
        const offset = noteValueToSeconds(_state.notesPlayed);

        const note = params['name'] as string;
        const octave = currentpitch.octave;
        const generic = testKeySignature.convertToGenericNoteName(note); //converts solfege to generic note, ie. do ---> n0
        let full = testKeySignature.modalPitchToLetter(
            parseInt(testKeySignature.genericNoteNameConvertToType(generic, SCALAR_MODE_NUMBER)) -
                1,
        ); //converts generic note to letter note, ie. n0 -----> d
        let fullNote = full[0] + (octave + full[1]);
        console.log(fullNote);
        _defaultSynth.triggerAttackRelease(fullNote, '4n', now + offset); //playing the note
        _state.notesPlayed += 1 / 4;
    }
}

export class PlayInterval extends ElementStatement {
    constructor() {
        super('play-interval', 'play interval', { interval: ['number'] });
    }

    onVisit(params: { [key: string]: TData }): void {
        const max = params['interval'] as number;

        for (let i = 0; i < 2; i++) {
            const now = Tone.now();
            let offset = noteValueToSeconds(_state.notesPlayed);

            let note = testKeySignature.modalPitchToLetter(
                parseInt(
                    testKeySignature.genericNoteNameConvertToType(
                        currentpitch._genericName,
                        SCALAR_MODE_NUMBER,
                    ),
                ) - 1,
            );

            console.log(note[0] + currentpitch.octave);
            _defaultSynth.triggerAttackRelease(note[0] + currentpitch.octave, '8n', now + offset);

            _state.notesPlayed += 1 / 8;
            currentpitch.applyScalarTransposition(max);
        }
        currentpitch._genericName = 'n1'; //resets
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

export { _state, _defaultSynth, _polySynth }