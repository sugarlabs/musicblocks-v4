/**
 * Testing module for Music Blocks execution engine
 * Provides plugin system and end-to-end testing capabilities
 */

export { MusicBlocksScheduler } from './music-blocks-scheduler';
export type { SchedulerStatus } from './music-blocks-scheduler';

export { PluginManager } from './plugins/plugin-manager';
export type {
    IPlugin,
    PluginResult,
    ExecutionContext,
    PluginArgs,
} from './plugins/plugin-interface';
