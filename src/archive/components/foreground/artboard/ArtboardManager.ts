// -- hooks ----------------------------------------------------------------------------------------

import { useMessageEndpoint } from '../../../hooks/messages';
import { useSignal } from '../../../hooks/messages';

// -- other components -----------------------------------------------------------------------------

import monitor from '../../../components/monitor/Monitor';

import ArtboardSprite from './ArtboardSprite';
import Artboard from './Artboard';

// -- model component ------------------------------------------------------------------------------

import Model from './models/ArtboardManager';
const model = new Model();

// -- view component -------------------------------------------------------------------------------

import view from './views/ArtboardManager';

// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the Artboard Manager component.
 */
export default function (): JSX.Element {
    const { registerMessageEndpoint } = useMessageEndpoint();
    const messageEndpoint = registerMessageEndpoint('artboard');
    monitor.artboardManager.registerMessageEndpoint(messageEndpoint);

    monitor.artboardManager.registerStateObject(model as unknown as { [key: string]: unknown });

    monitor.artboardManager.subscribe('viewportDimensions', 'viewportDimensions');

    const { registerSignalHandler } = useSignal();
    registerSignalHandler('artboard');

    // -- render -----------------------------------------------------------------------------------

    return view({
        viewportDimensions: model.viewportDimensions,
        artboardMap: model.artboardMap,
        children: {
            ArtboardSprite,
            Artboard,
        },
        initialPosition: { x: 0, y: 0 },
        initialHeading: 90,
    });
}
