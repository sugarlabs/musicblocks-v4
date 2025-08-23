import { IPlugin, PluginResult, PluginArgs } from '../plugin-interface';

/**
 * Forward Plugin - Blocking operation that moves forward
 */
export class ForwardPlugin implements IPlugin {
    public name = 'forward';

    public execute(args: PluginArgs[]): PluginResult {
        const steps = args.find((arg) => arg.param === 'steps')?.value as number;

        console.log(`[MOVEMENT] Moving forward ${steps} steps`);

        return {
            type: 'blocking',
            duration: 1000,
            value: { steps },
        };
    }
}

/**
 * Right Plugin - Blocking operation that turns right
 */
export class RightPlugin implements IPlugin {
    public name = 'right';

    public execute(args: PluginArgs[]): PluginResult {
        const angle = args.find((arg) => arg.param === 'angle')?.value as number;

        console.log(`[MOVEMENT] Turning right ${angle} degrees`);

        return {
            type: 'blocking',
            duration: 1000,
            value: { angle },
        };
    }
}

/**
 * Left Plugin - Blocking operation that turns left
 */
export class LeftPlugin implements IPlugin {
    public name = 'left';

    public execute(args: PluginArgs[]): PluginResult {
        const angle = args.find((arg) => arg.param === 'angle')?.value as number;

        console.log(`[MOVEMENT] Turning left ${angle} degrees`);

        return {
            type: 'blocking',
            duration: 1000,
            value: { angle },
        };
    }
}
