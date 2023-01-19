import type { IComponentDefinition } from '.';
import { TAsset } from '../core/assets';
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
    assets: Record<'audio.guitar' | 'audio.piano' | 'audio.snare', TAsset>;
};
