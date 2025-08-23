/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Music Blocks Scheduler for Testing
 *
 * This module provides a wrapper around the runtime's SchedulerAdapter
 * with Music Blocks-specific plugin manager integration and features.
 */

import { SchedulerAdapter, SchedulerStatus } from '../../runtime/src';
import { IRProgram } from '../../runtime/src/interpreter/ir-program';
import { PluginManager } from './plugins/plugin-manager';

/**
 * Music Blocks-specific scheduler wrapper that uses the production runtime's
 * SchedulerAdapter with Music Blocks plugin support and additional features
 */
export class MusicBlocksScheduler {
    private adapter: SchedulerAdapter;
    private pluginManager: PluginManager;

    constructor(pluginManager: PluginManager) {
        this.pluginManager = pluginManager;
        this.adapter = new SchedulerAdapter(pluginManager);
    }

    public load(program: IRProgram): void {
        this.adapter.load(program);
    }

    public start(): void {
        this.adapter.start();
    }

    public stop(): void {
        this.adapter.stop();
    }

    public getStatus(): SchedulerStatus {
        return this.adapter.getStatus();
    }

    public getExecutionLog(): string[] {
        return this.adapter.getExecutionLog();
    }

    public triggerEvent(eventName: string): void {
        this.adapter.triggerEvent(eventName);
    }

    /**
     * Register additional Music Blocks plugins dynamically
     */
    public registerPlugin(pluginName: string): void {
        const registeredPlugins = this.pluginManager.getRegisteredPlugins();
        if (!registeredPlugins.includes(pluginName)) {
            console.warn(
                `[MUSIC-BLOCKS-SCHEDULER] Plugin ${pluginName} not found in plugin manager`,
            );
            return;
        }

        console.log(`[MUSIC-BLOCKS-SCHEDULER] Plugin ${pluginName} registered`);
    }

    /**
     * Music Blocks-specific method to get musical timing information
     */
    public getMusicalTiming(): { bpm: number; currentBeat: number } {
        // This is a Music Blocks-specific feature that extends the basic scheduler
        return {
            bpm: 120,
            currentBeat: 0,
        };
    }

    /**
     * Music Blocks-specific method to handle note events
     */
    public playNote(note: string, duration: number): void {
        console.log(`[MUSIC-BLOCKS-SCHEDULER] Playing note ${note} for ${duration} beats`);
        this.triggerEvent(`note_${note}_${duration}`);
    }
}

export type { SchedulerStatus };
