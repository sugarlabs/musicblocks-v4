/**
 * Interface for external function registry that handles functions not defined in the program.
 * This interface is completely generic and domain-agnostic.
 */
export interface IExternalFunctionRegistry {
    /**
     * Check if an external function exists in the registry.
     */
    hasFunction(name: string): boolean;

    /**
     * Execute an external function with the given arguments.
     * Can return a value for functions that need to signal blocking or return data.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any;

    /**
     * Register a new external function (optional - for dynamic registration).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction?(name: string, func: (...args: any[]) => any): void;

    /**
     * Get list of all registered function names (optional - for introspection).
     */
    getRegisteredFunctions?(): string[];
}

/**
 * Generic external function registry that can work with any plugin manager
 * This makes the runtime completely domain-agnostic
 */
export interface IGenericPluginManager {
    hasFunction(name: string): boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction(name: string, func: (...args: any[]) => any): boolean;
    getRegisteredFunctions(): string[];
}

/**
 * Adapter that allows any plugin manager to work with the runtime
 */
export class GenericPluginAdapter implements IExternalFunctionRegistry {
    constructor(private pluginManager: IGenericPluginManager) {}

    hasFunction(name: string): boolean {
        return this.pluginManager.hasFunction(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any {
        return this.pluginManager.executeFunction(name, args);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction(name: string, func: (...args: any[]) => any): void {
        this.pluginManager.registerFunction(name, func);
    }

    getRegisteredFunctions(): string[] {
        return this.pluginManager.getRegisteredFunctions();
    }
}

/**
 * Default mock implementation for testing and demonstration.
 * This will log function calls instead of executing actual functionality.
 */
export class MockFunctionRegistry implements IExternalFunctionRegistry {
    private functions = new Set([
        // Mock Music Blocks functions for testing
        'playNote',
        'setKey',
        'setMasterVolume',
        'forward',
        'right',
        'left',
        'clear',
        'setInstrument',
        'decrescendo',
        'onNoteDo',
        'console.log',
        'break',
        'continue',
        'return',
        'Clear',
        'Start',
        'PlayNote',
        'SetKey',
        'SetBeat',
        'action',
        'action1',
        'action2',
        'doSomething',
        'doWork',
        'falseAction',
        'testFunc',
        'scalarStep',
        'outerWork',
        'trueAction',
        'innerWork',
        'Forward',
        'Finish',
        'Level1',
        'Level2',
        'Right',
        'Level1End',
        'End',
        'setContext_instrument',
        'resetContext_instrument',
        'setContext_volume',
        'resetContext_volume',
        'declareContext_key',
        'declareContext_mode',
        'alterSequence_duplicate',
        'alterSequence_backward',
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private dynamicFunctions = new Map<string, (...args: any[]) => any>();

    hasFunction(name: string): boolean {
        return (
            this.functions.has(name) ||
            this.dynamicFunctions.has(name) ||
            name.startsWith('setContext_') ||
            name.startsWith('resetContext_') ||
            name.startsWith('declareContext_') ||
            name.startsWith('alterSequence_')
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executeFunction(name: string, args: unknown[]): any {
        // Check if we have a dynamically registered function
        if (this.dynamicFunctions.has(name)) {
            return this.dynamicFunctions.get(name)!(...args);
        }

        console.log(`Call: ${name} with args: ${JSON.stringify(args)}`);
        // Return undefined for non-blocking functions
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerFunction(name: string, func: (...args: any[]) => any): void {
        this.dynamicFunctions.set(name, func);
    }
}
