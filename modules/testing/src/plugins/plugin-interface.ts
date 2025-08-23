/**
 * Plugin system interface for Music Blocks v4 operations
 */

export interface IPlugin {
    name: string;
    execute(args: PluginArgs[], context?: ExecutionContext): PluginResult;
}

export type PluginResult =
    | { type: 'immediate'; value?: unknown }
    | { type: 'blocking'; duration: number; value?: unknown }
    | { type: 'io_wait'; resource: string; value?: unknown }
    | { type: 'event_wait'; eventName: string; value?: unknown };

export interface ExecutionContext {
    instrument?: string;
    volume?: number;
    [key: string]: unknown;
}

export interface PluginArgs {
    param: string;
    value: unknown;
}
