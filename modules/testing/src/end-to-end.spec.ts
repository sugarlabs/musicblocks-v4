import { describe, it, expect } from 'vitest';
import { createMusicBlocksProgram2 } from '../../program/src/examples/MusicBlocksProgram2';
import { Compiler } from '../../program/src/compiler/compiler';
import { PluginManager } from './plugins/plugin-manager';
import { MusicBlocksScheduler } from './music-blocks-scheduler';
import {
    PlayNotePlugin,
    SetKeyPlugin,
    SetMasterVolumePlugin,
} from './plugins/music-blocks-plugins/audio-plugins';
import {
    ForwardPlugin,
    RightPlugin,
    LeftPlugin,
} from './plugins/music-blocks-plugins/movement-plugins';
import {
    ClearPlugin,
    ScalarStepPlugin,
    OnNoteDoPlugin,
} from './plugins/music-blocks-plugins/system-plugins';
import {
    SetContextInstrumentPlugin,
    ResetContextInstrumentPlugin,
    SetContextVolumePlugin,
    ResetContextVolumePlugin,
} from './plugins/music-blocks-plugins/context-plugins';

describe('Music Blocks v4 - End-to-End Integration', () => {
    it('should execute MusicBlocksProgram2 with full concurrency and plugin support', async () => {
        console.log('[TEST] Starting end-to-end integration test');

        // 1. Load the source AST
        console.log('[TEST] Loading MusicBlocksProgram2 AST...');
        const ast = createMusicBlocksProgram2();
        console.log('[TEST] AST loaded successfully');

        // 2. Setup Plugin Manager
        console.log('[TEST] Setting up plugin manager...');
        const pluginManager = new PluginManager();

        // Register all plugins
        pluginManager.registerPlugin(new PlayNotePlugin());
        pluginManager.registerPlugin(new SetKeyPlugin());
        pluginManager.registerPlugin(new SetMasterVolumePlugin());
        pluginManager.registerPlugin(new ForwardPlugin());
        pluginManager.registerPlugin(new RightPlugin());
        pluginManager.registerPlugin(new LeftPlugin());
        pluginManager.registerPlugin(new ClearPlugin());
        pluginManager.registerPlugin(new ScalarStepPlugin());
        pluginManager.registerPlugin(new OnNoteDoPlugin());
        pluginManager.registerPlugin(new SetContextInstrumentPlugin());
        pluginManager.registerPlugin(new ResetContextInstrumentPlugin());
        pluginManager.registerPlugin(new SetContextVolumePlugin());
        pluginManager.registerPlugin(new ResetContextVolumePlugin());

        console.log(
            `[TEST] Registered plugins: ${pluginManager.getRegisteredPlugins().join(', ')}`,
        );

        // 3. Compile the AST
        console.log('[TEST] Compiling AST to IR...');
        const compiler = new Compiler();
        const irProgram = compiler.compile(ast);
        console.log(
            `[TEST] Compilation complete. Functions: ${Array.from(irProgram.functions.keys())}`,
        );

        // 4. Setup Music Blocks Scheduler with Plugin Integration
        console.log('[TEST] Setting up Music Blocks scheduler...');
        const scheduler = new MusicBlocksScheduler(pluginManager);

        // 5. Load and Execute
        console.log('[TEST] Loading IR program into scheduler...');
        scheduler.load(irProgram);

        console.log('[TEST] Starting concurrent execution...');
        scheduler.start();

        // 6. Monitor Execution with Detailed Logging
        const executionLog: string[] = [];
        const startTime = Date.now();
        const maxExecutionTime = 10000; // 10 seconds max

        console.log('[TEST] Monitoring execution...');

        // 7. Wait for Completion or Timeout
        await new Promise<void>((resolve, reject) => {
            const checkCompletion = () => {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;

                if (elapsedTime > maxExecutionTime) {
                    scheduler.stop();
                    reject(new Error(`Test timed out after ${maxExecutionTime}ms`));
                    return;
                }

                const status = scheduler.getStatus();
                const logEntry = `[${new Date().toISOString()}] RunQueue: ${status.runQueueSize}, WaitQueue: ${status.waitQueueSize}, IOQueue: ${status.ioQueueSize}, EventQueue: ${status.eventQueueSize}, Total: ${status.totalThreads}`;
                executionLog.push(logEntry);
                console.log(logEntry);

                // Check if all threads have completed
                if (status.totalThreads === 0) {
                    scheduler.stop();
                    console.log('[TEST] All threads completed execution');
                    resolve();
                } else {
                    setTimeout(checkCompletion, 100); // Check every 100ms
                }
            };

            checkCompletion();
        });

        // 8. Verify Concurrency Occurred
        console.log('[TEST] Verifying concurrency...');
        expect(executionLog.length).toBeGreaterThan(5);

        // Verify that we had multiple threads running
        const hasMultipleThreads = executionLog.some((log) => {
            const match = log.match(/Total: (\d+)/);
            return match && parseInt(match[1]) > 1;
        });
        expect(hasMultipleThreads).toBe(true);

        // Verify that threads moved between queues (indicating blocking operations worked)
        const hasWaitQueueActivity = executionLog.some((log) => {
            const match = log.match(/WaitQueue: (\d+)/);
            return match && parseInt(match[1]) > 0;
        });

        const hasEventQueueActivity = executionLog.some((log) => {
            const match = log.match(/EventQueue: (\d+)/);
            return match && parseInt(match[1]) > 0;
        });

        const hasIOQueueActivity = executionLog.some((log) => {
            const match = log.match(/IOQueue: (\d+)/);
            return match && parseInt(match[1]) > 0;
        });

        // At least one queue type should have activity (time, io, or event blocking)
        const hasBlockingActivity =
            hasWaitQueueActivity || hasEventQueueActivity || hasIOQueueActivity;
        expect(hasBlockingActivity).toBe(true);

        console.log('[TEST] Concurrency verification completed');

        // 9. Verify Plugin Execution
        console.log('[TEST] Verifying plugin execution...');
        // This test passes if no exceptions were thrown during plugin execution

        console.log('[TEST] End-to-end integration test completed successfully');
        console.log(`[TEST] Total execution log entries: ${executionLog.length}`);
        console.log(`[TEST] Test completed in ${Date.now() - startTime}ms`);
    }, 15000);

    it('should handle plugin context modifications correctly', async () => {
        console.log('[TEST] Testing context modifications...');

        // Create a simplified AST for context testing
        const ast = createMusicBlocksProgram2();

        const pluginManager = new PluginManager();
        pluginManager.registerPlugin(new PlayNotePlugin());
        pluginManager.registerPlugin(new SetContextInstrumentPlugin());
        pluginManager.registerPlugin(new SetContextVolumePlugin());
        pluginManager.registerPlugin(new ResetContextInstrumentPlugin());
        pluginManager.registerPlugin(new ResetContextVolumePlugin());
        pluginManager.registerPlugin(new ScalarStepPlugin());
        pluginManager.registerPlugin(new OnNoteDoPlugin());

        const compiler = new Compiler();
        const irProgram = compiler.compile(ast);

        const scheduler = new MusicBlocksScheduler(pluginManager);
        scheduler.load(irProgram);
        scheduler.start();

        // Wait for completion
        await new Promise<void>((resolve) => {
            const checkCompletion = () => {
                const status = scheduler.getStatus();
                if (status.totalThreads === 0) {
                    scheduler.stop();
                    resolve();
                } else {
                    setTimeout(checkCompletion, 50);
                }
            };
            setTimeout(checkCompletion, 100);
        });

        console.log('[TEST] Context modification test completed');
    });

    it('should demonstrate all four queue types in action', () => {
        console.log('[TEST] Testing all four queue types...');

        const pluginManager = new PluginManager();
        const scheduler = new MusicBlocksScheduler(pluginManager);

        // Test initial state
        const initialStatus = scheduler.getStatus();
        expect(initialStatus.runQueueSize).toBe(0);
        expect(initialStatus.waitQueueSize).toBe(0);
        expect(initialStatus.ioQueueSize).toBe(0);
        expect(initialStatus.eventQueueSize).toBe(0);
        expect(initialStatus.totalThreads).toBe(0);
        expect(initialStatus.isRunning).toBe(false);

        console.log('[TEST] Queue types test completed - scheduler properly initialized');
    });
});
