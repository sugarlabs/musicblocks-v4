import { IPlugin, PluginResult, ExecutionContext, PluginArgs } from '../plugin-interface';

/**
 * Play Note Plugin - Blocking operation that plays a musical note
 */
export class PlayNotePlugin implements IPlugin {
    public name = 'playNote';

    public execute(args: PluginArgs[], context?: ExecutionContext): PluginResult {
        const pitch = args.find((arg) => arg.param === 'pitch')?.value as string;
        const duration = (args.find((arg) => arg.param === 'duration')?.value as number) || 1;
        const volume = (args.find((arg) => arg.param === 'volume')?.value as number) || 100;

        const contextVolume = context?.volume || 100;
        const contextInstrument = context?.instrument || 'default';
        const effectiveVolume = Math.min(volume, contextVolume);

        const timestamp = new Date().toISOString();
        console.log(
            `[AUDIO] Playing ${pitch} for ${duration}s at ${timestamp} ` +
                `(volume: ${effectiveVolume}, instrument: ${contextInstrument})`,
        );

        return {
            type: 'blocking',
            duration: duration * 1000, // Convert to milliseconds
            value: { pitch, duration, volume: effectiveVolume, instrument: contextInstrument },
        };
    }
}

/**
 * Set Key Plugin - Non-blocking operation that sets musical key
 */
export class SetKeyPlugin implements IPlugin {
    public name = 'setKey';

    public execute(args: PluginArgs[]): PluginResult {
        const key = args.find((arg) => arg.param === 'key')?.value as string;

        console.log(`[MUSIC] Setting key to ${key}`);

        return {
            type: 'immediate',
            value: { key },
        };
    }
}

/**
 * Set Master Volume Plugin - Non-blocking operation that sets global volume
 */
export class SetMasterVolumePlugin implements IPlugin {
    public name = 'setMasterVolume';

    public execute(args: PluginArgs[]): PluginResult {
        const volume = args.find((arg) => arg.param === 'volume')?.value as number;

        console.log(`[AUDIO] Setting master volume to ${volume}`);

        return {
            type: 'immediate',
            value: { masterVolume: volume },
        };
    }
}
