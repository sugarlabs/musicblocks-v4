/**
 * Interface for external function registry that handles functions not defined in the program.
 */
export interface IExternalFunctionRegistry {
    /**
     * Check if an external function exists in the registry.
     */
    hasFunction(name: string): boolean;

    /**
     * Execute an external function with the given arguments.
     * For mock implementations, this should just log the call.
     */
    executeFunction(name: string, args: unknown[]): void;
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

    hasFunction(name: string): boolean {
        return (
            this.functions.has(name) ||
            name.startsWith('setContext_') ||
            name.startsWith('resetContext_') ||
            name.startsWith('declareContext_') ||
            name.startsWith('alterSequence_')
        );
    }

    executeFunction(name: string, args: unknown[]): void {
        console.log(`Call: ${name} with args: ${JSON.stringify(args)}`);
    }
}
