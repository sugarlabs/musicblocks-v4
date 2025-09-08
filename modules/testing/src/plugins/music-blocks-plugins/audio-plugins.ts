import { IPlugin, PluginResult, ExecutionContext, PluginArgs } from '../plugin-interface';

/**
 * Play Note Plugin - Blocking operation that plays a musical note
 * Now supports all types of nested operations that execute during the note's duration
 */
export class PlayNotePlugin implements IPlugin {
    public name = 'playNote';

    public execute(args: PluginArgs[], context?: ExecutionContext): PluginResult {
        const pitch = args.find((arg) => arg.param === 'pitch')?.value as string;
        const duration = (args.find((arg) => arg.param === 'duration')?.value as number) || 1;
        const volume = (args.find((arg) => arg.param === 'volume')?.value as number) || 100;
        const nestedOperations =
            (args.find((arg) => arg.param === 'nestedOperations')?.value as Array<{
                name: string;
                args: unknown[];
            }>) || [];

        const contextVolume = context?.volume || 100;
        const contextInstrument = context?.instrument || 'default';
        const effectiveVolume = Math.min(volume, contextVolume);
        const quarterNoteDurationMs = 500;
        const durationMs = duration * 4 * quarterNoteDurationMs;

        const timestamp = new Date().toISOString();

        if (nestedOperations.length > 0) {
            console.log(
                `[AUDIO] Playing ${pitch} for ${duration * 4}s at ${timestamp} ` +
                    `(volume: ${effectiveVolume}, instrument: ${contextInstrument}) ` +
                    `with ${nestedOperations.length} nested operations`,
            );

            // Create note-scoped context for nested operations
            const noteContext = {
                ...context,
                currentNoteDuration: duration * 4,
                noteScope: true,
                parentDuration: durationMs,
            };

            // Execute nested operations with mixed timing approach
            this.executeNestedOperations(nestedOperations, noteContext, durationMs);

            return {
                type: 'blocking',
                duration: durationMs, // Total duration remains 500ms for compound operation
                value: {
                    pitch,
                    duration: duration * 4,
                    volume: effectiveVolume,
                    instrument: contextInstrument,
                    nestedOperations,
                    timing: 'concurrent',
                    noteContext,
                },
            };
        } else {
            console.log(
                `[AUDIO] Playing ${pitch} for ${duration * 4}s at ${timestamp} ` +
                    `(volume: ${effectiveVolume}, instrument: ${contextInstrument})`,
            );

            return {
                type: 'blocking',
                duration: durationMs,
                value: {
                    pitch,
                    duration: duration * 4,
                    volume: effectiveVolume,
                    instrument: contextInstrument,
                },
            };
        }
    }

    /**
     * Execute nested operations using mixed timing approach:
     * - Immediate plugins (system, context): Execute immediately
     * - Blocking plugins (movement): Execute sequentially within note duration
     * - Event plugins: Register at thread scope
     */
    private executeNestedOperations(
        operations: Array<{ name: string; args: unknown[] }>,
        noteContext: ExecutionContext,
        noteDuration: number,
    ): void {
        const immediatePlugins = ['clear', 'setKey', 'setMasterVolume', 'scalarStep'];
        const contextPlugins = [
            'setContext_instrument',
            'setContext_volume',
            'resetContext_instrument',
            'resetContext_volume',
        ];
        const eventPlugins = ['onNoteDo'];
        const blockingPlugins = ['forward', 'right', 'left'];

        let sequentialTime = 0;
        const blockingOps = operations.filter((op) => blockingPlugins.includes(op.name));
        const timePerBlockingOp = blockingOps.length > 0 ? noteDuration / blockingOps.length : 0;

        for (const operation of operations) {
            if (immediatePlugins.includes(operation.name)) {
                // Execute immediately
                console.log(
                    `[NESTED-IMMEDIATE] → ${operation.name} executing immediately during note`,
                );
                this.logOperationExecution(operation, 'immediate', 0);
            } else if (contextPlugins.includes(operation.name)) {
                // Execute immediately but note-scoped
                console.log(`[NESTED-CONTEXT] → ${operation.name} setting note-scoped context`);
                this.logOperationExecution(operation, 'note-context', 0);
            } else if (eventPlugins.includes(operation.name)) {
                // Register at thread scope
                console.log(`[NESTED-EVENT] → ${operation.name} registering thread-scoped event`);
                this.logOperationExecution(operation, 'thread-event', 0);
            } else if (blockingPlugins.includes(operation.name)) {
                // Execute sequentially within note duration
                console.log(
                    `[NESTED-BLOCKING] → ${operation.name} executing at ${sequentialTime}ms within note (${timePerBlockingOp}ms slot)`,
                );
                this.logOperationExecution(operation, 'sequential', sequentialTime);
                sequentialTime += timePerBlockingOp;
            } else {
                // Unknown plugin - treat as immediate
                console.log(
                    `[NESTED-UNKNOWN] → ${operation.name} executing immediately (unknown type)`,
                );
                this.logOperationExecution(operation, 'immediate', 0);
            }
        }
    }

    /**
     * Log operation execution details
     */
    private logOperationExecution(
        operation: { name: string; args: unknown[] },
        timing: string,
        timeOffset: number,
    ): void {
        const argsStr = operation.args.map((arg) => JSON.stringify(arg)).join(', ');
        console.log(
            `[NESTED-EXEC] ${operation.name}(${argsStr}) - timing: ${timing}, offset: ${timeOffset}ms`,
        );
    }
}
