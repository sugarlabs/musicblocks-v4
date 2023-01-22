import type { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';
import type { TInjectedSinger } from '@/@types/components/singer';

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
    'play-generic': {
        label: 'play generic',
        type: 'Statement',
        category: 'Music',
        prototype: PlayGenericNoteName,
    },
    'play-interval': {
        label: 'play interval',
        type: 'Statement',
        category: 'Music',
        prototype: PlayInterval,
    },
};
