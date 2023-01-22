import type { TAsset } from '../core/assets';

export type TComponentDefinitionElementsPainter =
    | 'move-forward'
    | 'move-backward'
    | 'turn-left'
    | 'turn-right'
    | 'set-xy'
    | 'set-heading'
    | 'draw-arc'
    | 'set-color'
    | 'set-thickness'
    | 'pen-up'
    | 'pen-down'
    | 'set-background'
    | 'clear';

export type TInjectedPainter = {
    flags: undefined;
    i18n: undefined;
    assets: Record<'image.icon.mouse', TAsset>;
};
