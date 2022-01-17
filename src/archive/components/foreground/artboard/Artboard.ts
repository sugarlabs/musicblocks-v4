import { useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IArtboardProps, TArtboardSpritePosition } from '../../../@types/artboard';

// -- hooks ----------------------------------------------------------------------------------------

// import { useMessageEndpoint } from '../../../hooks/messages';
import { useSignal } from '../../../hooks/messages';

// -- other components -----------------------------------------------------------------------------

// import monitor from '../../../monitor/Monitor';

// -- model component ------------------------------------------------------------------------------

import Model from './models/Artboard';

// -- view component -------------------------------------------------------------------------------

import view from './views/Artboard';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard sub-component.
 *
 * @param props - React props
 * @returns root JSX Element
 */
export default function (props: IArtboardProps): JSX.Element {
    const model = new Model(
        props.artboardID,
        props.spriteID,
        props.initialPosition,
        props.initialHeading,
    );

    const { retrieveSignalHandler } = useSignal();
    const signalHandler = retrieveSignalHandler('artboard')!;

    const [spritePosition, setSpritePosition] = useState(model.position);
    const [spriteHeading, setSpriteHeading] = useState(model.heading);

    signalHandler.addSignalListener(
        'updatePositionOnArtboard',
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
        signalHandler.dispatchSignal('updatePositionOnSprite', position);
    };

    const updateHeading = (heading: number) => {
        model.heading = heading;
        signalHandler.dispatchSignal('updateHeadingOnSprite', heading);
    };

    // -- render -----------------------------------------------------------------------------------

    return view({
        id: model.artboardID,
        position: spritePosition,
        updatePosition,
        heading: spriteHeading,
        updateHeading,
        dispatchSignal: (signalName, ...args) => signalHandler.dispatchSignal(signalName, ...args),
    });
}
