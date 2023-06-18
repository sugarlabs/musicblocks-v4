import { TAsset } from '../assets';

export type TComponentDefinitionElementsSinger =
    | 'test-synth'
    | 'play-note'
    | 'reset-notes-played'
    | 'play-generic'
    | 'play-interval';

export type TInjectedSinger = {
    flags: undefined;
    i18n: undefined;
    assets: Record<'audio.guitar' | 'audio.piano' | 'audio.snare', TAsset>;
};
