// -- types ----------------------------------------------------------------------------------------

import { IMessageUtils } from '../../@types/monitor';

// -- hooks ----------------------------------------------------------------------------------------

import { useForceUpdate } from '../../hooks/components';

// -- component definition -------------------------------------------------------------------------

/**
 * Class containing common utilities for Monitor's subcomponents.
 *
 * @description The individual subcomponent instances: Menu, Palette, etc. need to share some common
 * utilities. This class prevents code redundancy.
 */
export abstract class MessageUtils implements IMessageUtils {
    protected methodTable: { [key: string]: CallableFunction } = {};
    protected subscriptionTable: {
        [key: string]: (callback: (newValue: unknown) => void) => void;
    } = {};
    protected temporaryStore: { [key: string]: unknown } = {};
    protected messageEndpoint!: IMessageUtils;

    public registerMethod(name: string, method: CallableFunction): void {
        this.methodTable[name] = method;
    }

    public unregisterMethod(name: string): boolean {
        if (name in this.methodTable) {
            delete this.methodTable[name];
            return true;
        } else {
            return false;
        }
    }

    public doMethod(name: string, ...args: unknown[]): void {
        if (name in this.methodTable) {
            try {
                /* eslint-disable-next-line */
                (this.methodTable[name] as Function).call(this, ...args);
            } catch (e) {
                const error = e as Error;
                if (error instanceof TypeError) {
                    console.warn(
                        `${error.name} in method call, verify arguments.\nMessage: "${error.message}"`,
                    );
                } else {
                    console.warn(error);
                }
            }
        }
    }

    public getMethodResult(name: string, ...args: unknown[]): Promise<unknown> | null {
        if (name in this.methodTable) {
            try {
                /* eslint-disable-next-line */
                const result = (this.methodTable[name] as Function).call(this, ...args);
                return result instanceof Promise
                    ? result
                    : new Promise((resolve) => resolve(result));
            } catch (e) {
                const error = e as Error;
                if (error instanceof TypeError) {
                    console.warn(
                        `${error.name} in method call, verify arguments.\nMessage: "${error.message}"`,
                    );
                } else {
                    console.warn(error);
                }
            }
        }
        return null;
    }

    public registerStateObject(stateObject: { [key: string]: unknown }): void {
        const forceUpdate = useForceUpdate();

        this.methodTable['__get__'] = (state: string) => {
            if (state in stateObject) {
                return stateObject[state];
            } else {
                throw TypeError(`State '${state}' does not exist`);
            }
        };
        this.methodTable['__set__'] = (state: string, value: unknown) => {
            if (state in stateObject) {
                stateObject[state] = value;
                forceUpdate();
            } else {
                throw TypeError(`State '${state}' does not exist`);
            }
        };
    }

    public async getState(state: string): Promise<unknown> {
        return await this.getMethodResult('__get__', state);
    }

    public setState(state: string, value: unknown): void {
        this.doMethod('__set__', state, value);
    }

    public registerMessageEndpoint(messageEndpoint: IMessageUtils): void {
        this.messageEndpoint = messageEndpoint;
    }

    public subscribe(state: string, subscription: string): void {
        const callback = (newValue: unknown) => {
            (async () => {
                const oldValue = await this.getState(state);

                if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                    this.setState(state, newValue);
                }
            })();
        };
        /* eslint-disable-next-line */
        (this.subscriptionTable[subscription] as Function).call(this, callback);
    }
}
