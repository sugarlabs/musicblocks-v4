import type { IComponentDefinitionSinger, TInjectedSinger } from '@/@types/components/singer';

import { setup as setupComponent } from './singer';
import {
    ElementTestSynth,
    ElementResetNotesPlayed,
    ElementPlayNote,
    PlayGenericNoteName,
} from './singer';

// == definition ===================================================================================

export const definition: IComponentDefinitionSinger = {
    dependencies: {
        optional: ['menu'],
        required: [],
    },
    flags: {},
    strings: {},
    elements: {
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
    },
};

export const injected: TInjectedSinger = {
    flags: undefined,
    i18n: undefined,
    assets: undefined,
};

export const strings = definition.strings;

export const specification = definition.elements;

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
