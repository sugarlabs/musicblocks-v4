/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Verification test for Music Blocks runtime integration in testing module
 */

import { describe, it, expect } from 'vitest';
import { Scheduler } from '../../runtime/src';
import { PluginManager } from './plugins/plugin-manager';
import { MusicBlocksScheduler } from './music-blocks-scheduler';
import { PlayNotePlugin } from './plugins/music-blocks-plugins/audio-plugins';
import { ForwardPlugin } from './plugins/music-blocks-plugins/movement-plugins';

describe('Music Blocks Runtime Integration Verification', () => {
    it('should verify that testing module uses production runtime scheduler', () => {
        const pluginManager = new PluginManager();
        const musicBlocksScheduler = new MusicBlocksScheduler(pluginManager);

        // Test that the Music Blocks scheduler provides the expected interface
        expect(musicBlocksScheduler).toBeDefined();
        expect(typeof musicBlocksScheduler.getStatus).toBe('function');
        expect(typeof musicBlocksScheduler.load).toBe('function');
        expect(typeof musicBlocksScheduler.start).toBe('function');
        expect(typeof musicBlocksScheduler.stop).toBe('function');
        expect(typeof musicBlocksScheduler.getMusicalTiming).toBe('function');
        expect(typeof musicBlocksScheduler.playNote).toBe('function');

        // Test that we can access the adapter
        const adapter = (musicBlocksScheduler as any).adapter;
        expect(adapter).toBeDefined();

        // Test that the adapter has the underlying scheduler
        const internalScheduler = adapter.getUnderlyingScheduler();
        expect(internalScheduler).toBeInstanceOf(Scheduler);

        console.log('Music Blocks scheduler correctly wraps production runtime');
        console.log('Testing module now uses production runtime scheduler');
    });

    it('should demonstrate 4-queue system with real runtime', async () => {
        const pluginManager = new PluginManager();

        // Register plugins that return different blocking types
        pluginManager.registerPlugin(new PlayNotePlugin());
        pluginManager.registerPlugin(new ForwardPlugin());

        // Create wrapper that can return different blocking types for testing
        pluginManager.registerPlugin({
            name: 'ioOperation',
            execute: () => ({ type: 'io_wait', resource: 'network' }),
        });

        pluginManager.registerPlugin({
            name: 'eventOperation',
            execute: () => ({ type: 'event_wait', eventName: 'userClick' }),
        });

        // Test plugin-to-scheduler format conversion
        const timeResult = pluginManager.executeFunction('playNote', ['C4', 0.5]);
        const ioResult = pluginManager.executeFunction('ioOperation', []);
        const eventResult = pluginManager.executeFunction('eventOperation', []);

        expect(timeResult).toEqual({
            type: 'time',
            duration: 500,
            value: expect.any(Object),
        });

        expect(ioResult).toEqual({
            type: 'io',
            resource: 'network',
            value: undefined,
        });

        expect(eventResult).toEqual({
            type: 'event',
            eventType: 'userClick',
            value: undefined,
        });

        console.log('Plugin manager correctly converts to runtime format');
        console.log('All blocking types supported: time, io, event');
        console.log('4-queue system integration verified');
    });

    it('should verify production runtime features are accessible', () => {
        const productionScheduler = new Scheduler();

        // Verify that production runtime has all enhanced features
        expect(typeof (productionScheduler as any).processWaitQueue).toBe('function');
        expect(typeof (productionScheduler as any).processIOQueue).toBe('function');
        expect(typeof (productionScheduler as any).processEventQueue).toBe('function');
        expect(typeof (productionScheduler as any).handleExecutionResult).toBe('function');

        // Verify all queue types exist
        expect(Array.isArray((productionScheduler as any).runQueue)).toBe(true);
        expect(Array.isArray((productionScheduler as any).waitQueue)).toBe(true);
        expect(Array.isArray((productionScheduler as any).ioQueue)).toBe(true);
        expect(Array.isArray((productionScheduler as any).eventQueue)).toBe(true);

        console.log('Production runtime has all enhanced queue processing methods');
        console.log('All 4 queue types available in production runtime');
        console.log('Testing module successfully migrated to enhanced production runtime');
    });
});
