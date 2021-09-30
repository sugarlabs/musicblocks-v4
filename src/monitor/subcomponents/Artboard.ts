// -- other components -----------------------------------------------------------------------------

import { MessageUtils } from '../MessageUtils';
import { Monitor } from '../Monitor';

// -- subcomponent definition ----------------------------------------------------------------------

/**
 * Class representing the ArtboardManager subcomponent proxied by the Monitor component.
 */
export default class ArtboardManager extends MessageUtils {
    protected monitor: Monitor;

    constructor(monitor: Monitor) {
        super();
        this.monitor = monitor;

        this.methodTable = {
            clear: this._clear,
        };
    }

    private _clear(): void {
        console.log('clear');
    }
}
