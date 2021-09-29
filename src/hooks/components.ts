import { useState } from 'react';

import { SignalUtils } from '@/monitor/SignalUtils';
import monitor, { Monitor } from '@/monitor/Monitor';

/**
 * Returns a function that can be called to force a re-render of the component which calls it.
 */
export function useForceUpdate(): () => void {
    const [value, setValue] = useState(false);
    return () => setValue(!value);
}

/**
 * Returns a subclass instance of `SignalUtils` that can end as an endpoint for components to
 * receive signals from corresponding Monitor subcomponents.
 */
export function useSignalEndpoint(): SignalUtils {
    return new (class extends SignalUtils {
        protected monitor: Monitor;

        constructor() {
            super();
            this.monitor = monitor;
        }
    })();
}
