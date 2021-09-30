import { IMessageUtils } from '@/@types/monitor';

import { MessageUtils } from '@/monitor/MessageUtils';
import monitor, { Monitor } from '@/monitor/Monitor';

const messageEndpointMap: { [key: string]: IMessageUtils } = {};

/**
 * Returns a subclass instance of `MessageUtils` that can end as an endpoint for components to
 * receive messages from corresponding Monitor subcomponents.
 */
export function useMessageEndpoint(): {
    registerMessageEndpoint: (name: string) => IMessageUtils;
    retrieveMessageEndpoint: (name: string) => IMessageUtils | null;
} {
    function createMessageEndpoint(): IMessageUtils {
        return new (class extends MessageUtils {
            protected monitor: Monitor;

            constructor() {
                super();
                this.monitor = monitor;
            }
        })();
    }

    function registerMessageEndpoint(name: string): IMessageUtils {
        messageEndpointMap[name] = createMessageEndpoint();
        return messageEndpointMap[name];
    }

    function retrieveMessageEndpoint(name: string): IMessageUtils | null {
        return name in messageEndpointMap ? messageEndpointMap[name] : null;
    }

    return { registerMessageEndpoint, retrieveMessageEndpoint };
}
