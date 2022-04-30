import { setup as setupComponent } from './singer';

// -- public functions -----------------------------------------------------------------------------

/**
 * Mounts the Singer component.
 */
export function mount(): Promise<void> {
    return new Promise((resolve) => {
        resolve();
    });
}

/**
 * Initializes the Singer component.
 */
export function setup(): Promise<void> {
    return new Promise((resolve) => {
        (async () => {
            await setupComponent();

            resolve();
        })();
    });
}

// == specification ================================================================================

import { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

import { ElementTestSynth, ElementResetNotesPlayed, ElementPlayNote } from './singer';

// -------------------------------------------------------------------------------------------------

/**
 * Syntax element specification object for the Singer component.
 */
export const specification: {
    [identifier: string]: IElementSpecification;
} = {
    'test-synth': {
        label: 'test synth',
        type: 'Statement',
        category: 'Music',
        prototype: ElementTestSynth,
    },
    'play-note': {
        label: 'play note',
        type: 'Statement',
        category: 'Music',
        prototype: ElementPlayNote,
    },
    'reset-notes-played': {
        label: 'reset',
        type: 'Statement',
        category: 'Music',
        prototype: ElementResetNotesPlayed,
    },
};
