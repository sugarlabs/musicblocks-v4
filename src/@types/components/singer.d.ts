import type { IComponentDefinition } from '.';
import type { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

export type TComponentDefinitionElementsSinger =
    | 'test-synth'
    | 'play-note'
    | 'reset-notes-played'
    | 'play-generic';

export interface IComponentDefinitionSinger extends IComponentDefinition {
    elements: Record<TComponentDefinitionElementsSinger, IElementSpecification>;
}

export type TInjectedSinger = {
    flags: undefined;
    i18n: undefined;
    assets: undefined;
};
