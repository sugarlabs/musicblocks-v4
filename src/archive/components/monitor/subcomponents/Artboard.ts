// -- other components -----------------------------------------------------------------------------

import { MessageUtils } from '../MessageUtils';
import { Monitor } from '../Monitor';

// -- utils ----------------------------------------------------------------------------------------

import { getViewportDimensions } from '../../../utils/ambience';

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the ArtboardManager subcomponent proxied by the Monitor component.
 */
export default class ArtboardManager extends MessageUtils {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.subscriptionTable = {
            viewportDimensions: this._subscribeViewportDimensions,
        };

        this.methodTable = {
            clear: this._clearArtboards,
        };
    }

    // -- Subscriptions --------------------------------------------------------

    /** Subscribes to the width and height of the viewport. */
    private _subscribeViewportDimensions(callback: (newValue: unknown) => void): void {
        const updateViewportDimensions = () => callback(getViewportDimensions());

        window.addEventListener('load', updateViewportDimensions);
        window.addEventListener('resize', updateViewportDimensions);
    }

    // -- Getters for values ---------------------------------------------------

    // -- Actions --------------------------------------------------------------

    /** Clears the artboards. */
    private _clearArtboards(): void {
        console.log('clear artboards');
        this.messageEndpoint.doMethod('clearArtboards');
    }
}
