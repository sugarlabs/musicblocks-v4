import { IPlugin, PluginResult, PluginArgs } from '../plugin-interface';

/**
 * Set Context Plugin for instrument
 */
export class SetContextInstrumentPlugin implements IPlugin {
    public name = 'setContext_instrument';

    public execute(args: PluginArgs[]): PluginResult {
        const value = args[0]?.value as string;

        console.log(`[CONTEXT] Setting instrument context to: ${value}`);

        return {
            type: 'immediate',
            value: { context: 'instrument', value },
        };
    }
}

/**
 * Reset Context Plugin for instrument
 */
export class ResetContextInstrumentPlugin implements IPlugin {
    public name = 'resetContext_instrument';

    public execute(): PluginResult {
        console.log('[CONTEXT] Resetting instrument context');

        return {
            type: 'immediate',
            value: { context: 'instrument', action: 'reset' },
        };
    }
}

/**
 * Set Context Plugin for volume
 */
export class SetContextVolumePlugin implements IPlugin {
    public name = 'setContext_volume';

    public execute(args: PluginArgs[]): PluginResult {
        const value = args[0]?.value as number;

        console.log(`[CONTEXT] Setting volume context to: ${value}`);

        return {
            type: 'immediate',
            value: { context: 'volume', value },
        };
    }
}

/**
 * Reset Context Plugin for volume
 */
export class ResetContextVolumePlugin implements IPlugin {
    public name = 'resetContext_volume';

    public execute(): PluginResult {
        console.log('[CONTEXT] Resetting volume context');

        return {
            type: 'immediate',
            value: { context: 'volume', action: 'reset' },
        };
    }
}
