import type { IComponentDefinition } from '.';
import type { TAsset } from '../core/assets';
import type { IElementSpecification } from '@sugarlabs/musicblocks-v4-lib';

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

export interface IComponentDefinitionPainter extends IComponentDefinition {
    elements: Record<TComponentDefinitionElementsPainter, IElementSpecification>;
}

export type TInjectedPainter = {
    flags: undefined;
    i18n: undefined;
    assets: Record<'image.icon.mouse', TAsset>;
};
