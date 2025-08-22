import { IExternalFunctionRegistry } from '../execution/external-function-registry';

interface IPluginManager {
    hasFunction(name: string): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction?(name: string, func: (...args: any[]) => any): void;
}

/**
 * Adapter that bridges the plugin system with the runtime's external function registry
 * This makes the runtime completely generic and plugin-agnostic
 */
export class PluginRegistryAdapter implements IExternalFunctionRegistry {
    constructor(private pluginManager: IPluginManager) {}

    hasFunction(name: string): boolean {
        return this.pluginManager.hasFunction(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any {
        return this.pluginManager.executeFunction(name, args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction?(name: string, func: (...args: any[]) => any): void {
        this.pluginManager.registerFunction?.(name, func);
    }
}
