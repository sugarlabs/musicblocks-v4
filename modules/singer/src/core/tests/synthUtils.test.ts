/*
 * Copyright (c) 2026 Sugar Labs.
 *
 * Licensed under the AGPL-3.0 License.
 */

import * as Tone from 'tone';

import SynthUtils from '../synthUtils';

vi.mock('tone', async (importOriginal) => {
    const tone = await importOriginal<typeof import('tone')>();
    return {
        ...tone,
        Synth: class {
            toDestination() {
                return this;
            }
        },
    };
});

describe('SynthUtils', () => {
    test('setVolume updates the volume of a builtin synth in the map', () => {
        const synth = { volume: { value: 0 } } as unknown as Tone.PolySynth;
        const synthUtils = Object.create(SynthUtils.prototype) as SynthUtils;
        synthUtils.builtinSynths = new Map([['test synth', synth]]);
        synthUtils.samplerSynths = new Map();
        synthUtils.playerSynths = new Map();
        synthUtils.samples = {};

        synthUtils.setVolume('test synth', 50);

        expect(synth.volume.value).toBe(Tone.gainToDb(0.5));
    });
});
