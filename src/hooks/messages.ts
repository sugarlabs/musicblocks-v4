// -- useMessageEndpoint ---------------------------------------------------------------------------

import { IMessageUtils } from '@/@types/monitor';

import { MessageUtils } from '@/components/monitor/MessageUtils';
import monitor, { Monitor } from '@/components/monitor/Monitor';

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

// -- useSignal ------------------------------------------------------------------------------------

export interface ISignalHandler {
    dispatchSignal(name: string, ...args: unknown[]): void;
    addSignalListener(name: string, callback: CallableFunction): void;
    removeSignalListener(name: string, callback: CallableFunction): void;
}

const signalMap: {
    [key: string]: ISignalHandler;
} = {};

export function useSignal(): {
    registerSignalHandler: (name: string) => ISignalHandler;
    retrieveSignalHandler: (name: string) => ISignalHandler | null;
} {
    class SignalHandler implements ISignalHandler {
        private _signalMap: { [key: string]: Set<CallableFunction> } = {};

        public dispatchSignal(name: string, ...args: unknown[]): void {
            setTimeout(() => {
                if (name in this._signalMap) {
                    this._signalMap[name].forEach((callback) => callback(...args));
                }
            });
        }

        public addSignalListener(name: string, callback: CallableFunction): void {
            setTimeout(() => {
                if (!(name in this._signalMap)) {
                    this._signalMap[name] = new Set<CallableFunction>();
                }
                this._signalMap[name].add(callback);
            });
        }

        public removeSignalListener(name: string, callback: CallableFunction): void {
            setTimeout(() => {
                if (name in this._signalMap) {
                    this._signalMap[name].delete(callback);
                }
            });
        }
    }

    function registerSignalHandler(name: string): ISignalHandler {
        signalMap[name] = new SignalHandler();
        return signalMap[name];
    }

    function retrieveSignalHandler(name: string): ISignalHandler | null {
        return name in signalMap ? signalMap[name] : null;
    }

    return { registerSignalHandler, retrieveSignalHandler };
}
