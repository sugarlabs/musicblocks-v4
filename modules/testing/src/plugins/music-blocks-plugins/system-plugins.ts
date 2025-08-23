import { IPlugin, PluginResult, PluginArgs } from '../plugin-interface';

/**
 * Clear Plugin - Non-blocking operation that clears the screen
 */
export class ClearPlugin implements IPlugin {
    public name = 'clear';

    public execute(): PluginResult {
        console.log('[SYSTEM] Clearing screen');

        return {
            type: 'immediate',
            value: { action: 'clear' },
        };
    }
}

/**
 * Scalar Step Plugin - Non-blocking operation that sets scalar step
 */
export class ScalarStepPlugin implements IPlugin {
    public name = 'scalarStep';

    public execute(args: PluginArgs[]): PluginResult {
        const value = args.find((arg) => arg.param === 'value')?.value as number;

        console.log(`[MUSIC] Setting scalar step to ${value}`);

        return {
            type: 'immediate',
            value: { scalarStep: value },
        };
    }
}

/**
 * On Note Do Plugin - Event listener registration
 */
export class OnNoteDoPlugin implements IPlugin {
    public name = 'onNoteDo';

    public execute(args: PluginArgs[]): PluginResult {
        const callback = args.find((arg) => arg.param === 'callback')?.value as string;

        console.log(`[EVENT] Registering note event listener with callback: ${callback}`);

        return {
            type: 'event_wait',
            eventName: 'noteEvent',
            value: { callback },
        };
    }
}
