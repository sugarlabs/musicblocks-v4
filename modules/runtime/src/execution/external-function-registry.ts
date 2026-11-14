import { CurrentPitch, KeySignature, Temperament } from '@sugarlabs/mb4-module-singer/core';

import { MusicContext, defaultMusicContext } from '../music/context';
import { NoteEvent } from '../music/note-event';

/**
 * Interface for external function registry that handles functions not defined in the program.
 */
export interface IExternalFunctionRegistry {
    /**
     * Check if an external function exists in the registry.
     */
    hasFunction(name: string): boolean;

    /**
     * Execute an external function with the given arguments.
     * The music context is the state the call may read or mutate.
     */
    executeFunction(name: string, args: unknown[], music: MusicContext, events?: NoteEvent[]): void;
}

/**
 * Default mock implementation for testing and demonstration.
 * This will log function calls instead of executing actual functionality.
 */
export class MockFunctionRegistry implements IExternalFunctionRegistry {
    private functions = new Set([
        // Mock Music Blocks functions for testing
        'playNote',
        'setKey',
        'setMasterVolume',
        'forward',
        'right',
        'left',
        'clear',
        'setInstrument',
        'decrescendo',
        'onNoteDo',
        'console.log',
        'break',
        'continue',
        'return',
        'Clear',
        'Start',
        'PlayNote',
        'SetKey',
        'SetBeat',
        'action',
        'action1',
        'action2',
        'doSomething',
        'doWork',
        'falseAction',
        'testFunc',
        'scalarStep',
        'outerWork',
        'trueAction',
        'innerWork',
        'Forward',
        'Finish',
        'Level1',
        'Level2',
        'Right',
        'Level1End',
        'End',
        'setContext_instrument',
        'resetContext_instrument',
        'setContext_volume',
        'resetContext_volume',
        'declareContext_key',
        'declareContext_mode',
        'alterSequence_duplicate',
        'alterSequence_backward',
    ]);

    hasFunction(name: string): boolean {
        return (
            this.functions.has(name) ||
            name.startsWith('setContext_') ||
            name.startsWith('resetContext_') ||
            name.startsWith('declareContext_') ||
            name.startsWith('alterSequence_')
        );
    }

    executeFunction(
        name: string,
        args: unknown[],
        _music: MusicContext,
        _events?: NoteEvent[],
    ): void {
        console.log(`Call: ${name} with args: ${JSON.stringify(args)}`);
    }
}

/**
 * Maps a context parameter name (the suffix of a `setContext_*` call) to a field of MusicContext.
 */
const CONTEXT_FIELD: Record<string, keyof MusicContext> = {
    key: 'key',
    mode: 'mode',
    movableDo: 'movableDo',
    temperament: 'temperament',
    octave: 'octave',
    volume: 'volume',
    instrument: 'instrument',
};

/**
 * Real registry that routes music calls into the music context.
 *
 * `setContext_<name>` saves the current value then sets the new one. `resetContext_<name>` restores
 * the saved value, falling back to the default when nothing was saved. `declareContext_<name>` sets
 * the value without saving (it persists past the body, as the compiler emits no reset for it).
 *
 * `playNote` is not resolved yet; that is wired to singer in the next step.
 */
export class SingerFunctionRegistry implements IExternalFunctionRegistry {
    private _saved = new WeakMap<MusicContext, Map<string, unknown[]>>();

    hasFunction(name: string): boolean {
        return (
            name === 'playNote' ||
            name.startsWith('setContext_') ||
            name.startsWith('resetContext_') ||
            name.startsWith('declareContext_')
        );
    }

    executeFunction(
        name: string,
        args: unknown[],
        music: MusicContext,
        events?: NoteEvent[],
    ): void {
        if (name.startsWith('setContext_')) {
            this._setField(name.slice('setContext_'.length), args[0], music, true);
        } else if (name.startsWith('declareContext_')) {
            this._setField(name.slice('declareContext_'.length), args[0], music, false);
        } else if (name.startsWith('resetContext_')) {
            this._resetField(name.slice('resetContext_'.length), music);
        } else if (name === 'playNote') {
            this._playNote(args, music, events);
        }
    }

    /**
     * Resolves a written pitch through the music context and appends a note event.
     */
    private _playNote(args: unknown[], music: MusicContext, events?: NoteEvent[]): void {
        if (events === undefined) {
            return;
        }
        const pitchName = String(args[0]);
        const durationBeats = Number(args[1]);

        const keySignature = new KeySignature(music.mode, music.key);
        const temperament = new Temperament(music.temperament);
        const current = new CurrentPitch(keySignature, temperament);
        current.setPitch(pitchName, music.octave);

        events.push({
            hz: current.freq,
            name: current.genericName,
            octave: current.octave,
            cents: 0,
            durationBeats,
            instrument: music.instrument,
            volume: music.volume,
        });
    }

    private _setField(param: string, value: unknown, music: MusicContext, save: boolean): void {
        const field = this._fieldFor(param);
        if (field === undefined) {
            console.warn(`unknown context parameter: ${param}`);
            return;
        }
        if (save) {
            const saved = this._savedFor(music);
            const stack = saved.get(param) ?? [];
            stack.push(music[field]);
            saved.set(param, stack);
        }
        this._assign(music, field, value);
    }

    private _resetField(param: string, music: MusicContext): void {
        const field = this._fieldFor(param);
        if (field === undefined) {
            console.warn(`unknown context parameter: ${param}`);
            return;
        }
        const stack = this._savedFor(music).get(param);
        if (stack !== undefined && stack.length > 0) {
            this._assign(music, field, stack.pop());
        } else {
            this._assign(music, field, defaultMusicContext()[field]);
        }
    }

    /**
     * Maps a context parameter to its field, ignoring inherited object properties.
     */
    private _fieldFor(param: string): keyof MusicContext | undefined {
        return Object.prototype.hasOwnProperty.call(CONTEXT_FIELD, param)
            ? CONTEXT_FIELD[param]
            : undefined;
    }

    /**
     * Returns the saved-value stacks for one music context.
     */
    private _savedFor(music: MusicContext): Map<string, unknown[]> {
        let saved = this._saved.get(music);
        if (saved === undefined) {
            saved = new Map<string, unknown[]>();
            this._saved.set(music, saved);
        }
        return saved;
    }

    /**
     * Assigns a value to a context field, coercing it to the field's type.
     */
    private _assign(music: MusicContext, field: keyof MusicContext, value: unknown): void {
        const sample = defaultMusicContext()[field];
        const record = music as unknown as Record<string, unknown>;
        if (typeof sample === 'number') {
            record[field] = Number(value);
        } else if (typeof sample === 'boolean') {
            record[field] = Boolean(value);
        } else {
            record[field] = String(value);
        }
    }
}
