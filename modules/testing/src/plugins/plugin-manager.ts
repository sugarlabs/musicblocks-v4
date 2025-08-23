import { IPlugin, PluginResult, ExecutionContext, PluginArgs } from './plugin-interface';
import { IExternalFunctionRegistry } from '../../../runtime/src/execution/external-function-registry';

/**
 * Plugin Manager for registering and executing Music Blocks operations
 */
export class PluginManager implements IExternalFunctionRegistry {
    private plugins: Map<string, IPlugin> = new Map();
    private eventListeners: Map<string, string[]> = new Map();
    private currentContext: ExecutionContext = {};

    /**
     * Register a plugin
     */
    public registerPlugin(plugin: IPlugin): void {
        this.plugins.set(plugin.name, plugin);
        console.log(`[PLUGIN] Registered plugin: ${plugin.name}`);
    }

    /**
     * Execute a plugin - called by the IR interpreter
     */
    public executeFunction(name: string, args: unknown[]): unknown {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            console.log(`[PLUGIN] Plugin not found: ${name}, falling back to mock`);
            return this.mockFunction(name, args);
        }
        const pluginArgs: PluginArgs[] = [];

        if (name === 'playNote') {
            pluginArgs.push({ param: 'pitch', value: args[0] });
            if (args.length > 1) pluginArgs.push({ param: 'duration', value: args[1] });
            if (args.length > 2) pluginArgs.push({ param: 'volume', value: args[2] });
        } else if (name === 'setKey') {
            pluginArgs.push({ param: 'key', value: args[0] });
        } else if (name === 'setMasterVolume') {
            pluginArgs.push({ param: 'volume', value: args[0] });
        } else if (name === 'forward') {
            pluginArgs.push({ param: 'steps', value: args[0] });
        } else if (name === 'right') {
            pluginArgs.push({ param: 'angle', value: args[0] });
        } else if (name === 'left') {
            pluginArgs.push({ param: 'angle', value: args[0] });
        } else if (name === 'scalarStep') {
            pluginArgs.push({ param: 'value', value: args[0] });
        } else if (name === 'onNoteDo') {
            pluginArgs.push({ param: 'callback', value: args[0] });
        } else if (name.startsWith('setContext_')) {
            const contextType = name.replace('setContext_', '');
            pluginArgs.push({ param: 'value', value: args[0] });
            this.currentContext[contextType] = args[0];
        } else if (name.startsWith('resetContext_')) {
            const contextType = name.replace('resetContext_', '');
            delete this.currentContext[contextType];
        } else {
            for (let i = 0; i < args.length; i++) {
                pluginArgs.push({ param: `arg${i}`, value: args[i] });
            }
        }

        console.log(`[PLUGIN] Executing plugin: ${name} with args:`, pluginArgs);
        const result = plugin.execute(pluginArgs, this.currentContext);
        console.log(`[PLUGIN] Plugin ${name} result:`, result);

        // Convert PluginResult to scheduler-compatible format
        return this.convertPluginResultToSchedulerFormat(result);
    }

    /**
     * Check if plugin exists
     */
    public hasFunction(name: string): boolean {
        return this.plugins.has(name);
    }

    /**
     * Register an external function
     */
    public registerFunction(name: string, func: (...args: unknown[]) => unknown): void {
        const wrapperPlugin: IPlugin = {
            name,
            execute: (args: PluginArgs[]) => {
                const values = args.map((arg) => arg.value);
                const result = func(...values);
                return { type: 'immediate', value: result };
            },
        };
        this.registerPlugin(wrapperPlugin);
    }

    /**
     * Register an event listener
     */
    public registerEventListener(eventName: string, callbackName: string): void {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName)!.push(callbackName);
        console.log(`[EVENT] Registered listener ${callbackName} for event: ${eventName}`);
    }

    /**
     * Trigger an event and get all callback names
     */
    public triggerEvent(eventName: string): string[] {
        const callbacks = this.eventListeners.get(eventName) || [];
        console.log(`[EVENT] Triggering event ${eventName}, callbacks:`, callbacks);
        return callbacks;
    }

    /**
     * Set execution context for nested operations
     */
    public setContext(context: ExecutionContext): void {
        this.currentContext = { ...this.currentContext, ...context };
        console.log(`[CONTEXT] Updated context:`, this.currentContext);
    }

    /**
     * Reset execution context
     */
    public resetContext(keys?: string[]): void {
        if (keys) {
            for (const key of keys) {
                delete this.currentContext[key];
            }
        } else {
            this.currentContext = {};
        }
        console.log(`[CONTEXT] Reset context:`, this.currentContext);
    }

    /**
     * Get all registered plugins
     */
    public getRegisteredPlugins(): string[] {
        return Array.from(this.plugins.keys());
    }

    /**
     * Get registered functions (for IExternalFunctionRegistry compatibility)
     */
    public getRegisteredFunctions(): string[] {
        return this.getRegisteredPlugins();
    }

    /**
     * Convert PluginResult to format expected by the scheduler
     */
    private convertPluginResultToSchedulerFormat(result: PluginResult): unknown {
        switch (result.type) {
            case 'immediate':
                return result.value;

            case 'blocking':
                return {
                    type: 'time',
                    duration: result.duration, // Duration should already be in milliseconds
                    value: result.value,
                };

            case 'io_wait':
                return {
                    type: 'io',
                    resource: result.resource,
                    value: result.value,
                };

            case 'event_wait':
                return {
                    type: 'event',
                    eventType: result.eventName,
                    value: result.value,
                };

            default:
                return undefined;
        }
    }

    /**
     * Mock function for unregistered functions
     */
    private mockFunction(name: string, args: unknown[]): unknown {
        console.log(`[MOCK] Call: ${name} with args: ${JSON.stringify(args)}`);
        return undefined;
    }
}
