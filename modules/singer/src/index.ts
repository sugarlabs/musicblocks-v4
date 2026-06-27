import type { IElementSpecification } from '@sugarlabs/mb4-module-engine.old';
import type { TInjectedSinger } from '#/@types/components/singer';

import { setup as setupComponent } from './singer';
import {
    ElementTestSynth,
    ElementResetNotesPlayed,
    ElementPlayNote,
    PlayGenericNoteName,
    PlayInterval,
} from './singer';

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

// -- public variables -----------------------------------------------------------------------------

export const injected: TInjectedSinger = {
    // @ts-ignore
    flags: undefined,
    // @ts-ignore
    i18n: undefined,
    // @ts-ignore
    assets: undefined,
};

export const elements: Record<string, IElementSpecification> = {
    'test-synth': {
        label: 'test synth',
        type: 'Statement',
        classification: {
            group: 'Music',
            category: 'Rhythm',
        },
        prototype: ElementTestSynth,
    },
    'play-note': {
        label: 'play note',
        type: 'Statement',
        classification: {
            group: 'Music',
            category: 'Rhythm',
        },
        prototype: ElementPlayNote,
    },
    'reset-notes-played': {
        label: 'reset',
        type: 'Statement',
        classification: {
            group: 'Music',
            category: 'Rhythm',
        },
        prototype: ElementResetNotesPlayed,
    },
    'play-generic': {
        label: 'play generic',
        type: 'Statement',
        classification: {
            group: 'Music',
            category: 'Rhythm',
        },
        prototype: PlayGenericNoteName,
    },
    'play-interval': {
        label: 'play interval',
        type: 'Statement',
        classification: {
            group: 'Music',
            category: 'Rhythm',
        },
        prototype: PlayInterval,
    },
};
