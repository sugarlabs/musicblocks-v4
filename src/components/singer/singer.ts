import * as Tone from 'tone';

// -- private variables ----------------------------------------------------------------------------

/** Default synth **/
const _defaultSynth = new Tone.Synth().toDestination();

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

import { ElementStatement } from '@sugarlabs/musicblocks-v4-lib';

/**
 * @class
 * Defines a `music` statement element that tests the synth.
 */
export class ElementTestSynth extends ElementStatement {
    constructor() {
        super('test-synth', 'test synth', {});
    }

    /**
     * Plays a predefined note.
     */
    onVisit(): void {
        _defaultSynth.triggerAttackRelease("C4", "8n");
    }
}
