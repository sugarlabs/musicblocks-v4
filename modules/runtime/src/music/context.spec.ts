import { describe, it, expect } from 'vitest';
import { defaultMusicContext } from './context';
import { ExecutionContext } from '../interpreter/execution-context';
import { IRProgram } from '../interpreter/ir-program';
import { IRFunction } from '../interpreter/ir-function';

describe('MusicContext', () => {
    it('defaultMusicContext returns C major, equal temperament, A440 defaults', () => {
        expect(defaultMusicContext()).toEqual({
            key: 'c',
            mode: 'major',
            movableDo: false,
            temperament: 'equal',
            octave: 4,
            volume: 50,
            instrument: 'electronic synth',
        });
    });

    it('returns a fresh object each call so contexts do not share state', () => {
        const a = defaultMusicContext();
        const b = defaultMusicContext();
        a.key = 'g';
        expect(b.key).toBe('c');
    });

    it('is attached to a new ExecutionContext with the defaults', () => {
        const program = new IRProgram(new Map<string, IRFunction>());
        const context = new ExecutionContext(program);

        expect(context.music).toEqual(defaultMusicContext());
    });
});
