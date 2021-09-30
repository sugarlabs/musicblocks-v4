// -- types ----------------------------------------------------------------------------------------

import { IMessageUtils } from '@/@types/monitor';

// -- hooks ----------------------------------------------------------------------------------------

import { useForceUpdate } from '@/hooks/components';

// -- component definition -------------------------------------------------------------------------

/**
 * Class containing common utilities for Monitor's subcomponents.
 *
 * @description The individual subcomponent instances: Menu, Palette, etc. need to share some common
 * utilities. This class prevents code redundancy.
 */
export abstract class MessageUtils implements IMessageUtils {
    /* eslint-disable-next-line */
    protected methodTable: { [key: string]: Function } = {};
    protected temporaryStore: { [key: string]: unknown } = {};
    protected messageEndpoint!: IMessageUtils;

    /* eslint-disable-next-line */
    public registerMethod(name: string, method: Function): void {
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
                this.methodTable[name].call(this, ...args);
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
                const result = this.methodTable[name].call(this, ...args);
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

    public getState(state: string): unknown {
        return (async () => await this.getMethodResult('__get__', state))();
    }

    public setState(state: string, value: unknown): void {
        this.doMethod('__set__', state, value);
    }

    public registerEndpoint(messageEndpoint: IMessageUtils): void {
        this.messageEndpoint = messageEndpoint;
    }
}
