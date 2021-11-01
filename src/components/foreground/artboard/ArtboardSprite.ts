import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IArtboardSpriteProps, TArtboardSpritePosition } from '@/@types/artboard';

// -- hooks ----------------------------------------------------------------------------------------

import { useSignal } from '@/hooks/messages';

// -- model class ----------------------------------------------------------------------------------

import Model from './models/ArtboardSprite';

// -- view component -------------------------------------------------------------------------------

import view from './views/ArtboardSprite';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Sprite sub-component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: IArtboardSpriteProps): JSX.Element {
    const model = new Model(
        props.spriteID,
        props.artboardID,
        props.initialPosition,
        props.initialHeading,
        props.color,
    );

    const { retrieveSignalHandler } = useSignal();
    const signalHandler = retrieveSignalHandler('artboard')!;

    const [spritePosition, setSpritePosition] = useState(model.position);
    const [spriteHeading, setSpriteHeading] = useState(model.heading);

    signalHandler.addSignalListener(
        'updatePositionOnSprite',
        (position: TArtboardSpritePosition) => {
            model.position = position;
            setSpritePosition(position);
        },
    );

    signalHandler.addSignalListener('updateHeadingOnSprite', (heading: number) => {
        model.heading = heading;
        setSpriteHeading(heading);
    });

    const updatePosition = (position: TArtboardSpritePosition) => {
        model.position = position;
        signalHandler.dispatchSignal('updatePositionOnArtboard', position);
    };

    // -- render -----------------------------------------------------------------------------------

    return view({
        id: model.spriteID,
        position: spritePosition,
        updatePosition,
        heading: spriteHeading,
        color: model.color,
        dispatchSignal: (signalName, ...args) => signalHandler.dispatchSignal(signalName, ...args),
    });
}
