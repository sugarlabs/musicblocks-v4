import { IPlugin, PluginResult, PluginArgs, ExecutionContext } from '../plugin-interface';

/**
 * Forward Plugin - Context-aware blocking operation that moves forward
 * Timing depends on context: 500ms outside notes, note duration inside notes
 */
export class ForwardPlugin implements IPlugin {
    public name = 'forward';

    public execute(args: PluginArgs[], context?: ExecutionContext): PluginResult {
        const steps = args.find((arg) => arg.param === 'steps')?.value as number;
        let duration = 500;
        if (context && context.currentNoteDuration) {
            duration = (context.currentNoteDuration as number) * 1000;
            console.log(
                `[MOVEMENT] Moving forward ${steps} steps (concurrent with note: ${duration}ms)`,
            );
        } else {
            console.log(`[MOVEMENT] Moving forward ${steps} steps (standalone: ${duration}ms)`);
        }

        return {
            type: 'blocking',
            duration,
            value: { steps, contextDuration: duration },
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
