import { ISignalUtils } from '@/@types/monitor';

import { SignalUtils } from '@/monitor/SignalUtils';
import monitor, { Monitor } from '@/monitor/Monitor';

const signalEndpointMap: { [key: string]: ISignalUtils } = {};

/**
 * Returns a subclass instance of `SignalUtils` that can end as an endpoint for components to
 * receive signals from corresponding Monitor subcomponents.
 */
export function useSignalEndpoint(): {
    registerSignalEndpoint: (name: string) => ISignalUtils;
    retrieveSignalEndpoint: (name: string) => ISignalUtils | null;
} {
    function createSignalEndpoint(): ISignalUtils {
        return new (class extends SignalUtils {
            protected monitor: Monitor;

            constructor() {
                super();
                this.monitor = monitor;
            }
        })();
    }

    function registerSignalEndpoint(name: string): ISignalUtils {
        signalEndpointMap[name] = createSignalEndpoint();
        return signalEndpointMap[name];
    }

    function retrieveSignalEndpoint(name: string): ISignalUtils | null {
        return name in signalEndpointMap ? signalEndpointMap[name] : null;
    }

    return { registerSignalEndpoint, retrieveSignalEndpoint };
}
