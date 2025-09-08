/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Timing Verification Tests for Scheduler
 *
 * These tests verify the actual timing behavior of the scheduler system
 * to ensure accurate timing for Music Blocks operations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Compiler } from '../../program/src/compiler/compiler';
import { PluginManager } from './plugins/plugin-manager';
import { MusicBlocksScheduler } from './music-blocks-scheduler';
import {
    createSequentialNotesProgram,
    createNotesWithForwardsProgram,
    createVariableForwardsProgram,
    createConcurrentNotesProgram,
    createMultiThreadSequentialNotesProgram,
    createMultiThreadMixedProgram,
    createMultiThreadAsyncProgram,
    createNestedOperationsProgram,
    createMixedNestedOperationsProgram,
    createContextIsolationProgram,
    createDurationCompressionProgram,
} from './examples/timing-test-programs';

// Import plugins
import { registerAllPlugins } from './plugins/plugin-registry';

interface TimingResult {
    expectedTimeMs: number;
    actualTimeMs: number;
    tolerance: number;
    passed: boolean;
    operations: string[];
}

describe('Scheduler Timing Verification', () => {
    let pluginManager: PluginManager;
    let scheduler: MusicBlocksScheduler;
    let compiler: Compiler;

    beforeEach(() => {
        pluginManager = new PluginManager();

        // Register all plugins through centralized registry
        registerAllPlugins(pluginManager);

        scheduler = new MusicBlocksScheduler(pluginManager);
        compiler = new Compiler();
    });

    /**
     * Helper function to execute a program and measure timing
     */
    async function measureProgramTiming(
        programName: string,
        programCreator: () => unknown,
        expectedTimeMs: number,
        description: string,
    ): Promise<TimingResult> {
        console.log(`\\n[TIMING-TEST] Starting ${programName}: ${description}`);
        console.log(`[TIMING-TEST] Expected time: ${expectedTimeMs}ms`);

        // Compile the program
        const ast = programCreator() as any;
        const irProgram = compiler.compile(ast);

        // Measure actual execution time
        const startTime = performance.now();

        scheduler.load(irProgram);
        scheduler.start();

        // Wait for completion with timeout
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
                scheduler.stop();
                reject(new Error(`Test timed out after ${expectedTimeMs * 3}ms`));
            }, expectedTimeMs * 3);

            const checkCompletion = () => {
                const status = scheduler.getStatus();
                const totalThreads =
                    status.runQueueSize +
                    status.waitQueueSize +
                    status.ioQueueSize +
                    status.eventQueueSize;

                if (totalThreads === 0) {
                    clearTimeout(timeout);
                    scheduler.stop();
                    resolve();
                } else {
                    setTimeout(checkCompletion, 10);
                }
            };

            setTimeout(checkCompletion, 10);
        });

        const endTime = performance.now();
        const actualTimeMs = endTime - startTime;

        // Calculate tolerance (±15% or ±50ms, whichever is larger)
        const tolerance = Math.max(expectedTimeMs * 0.15, 50);
        const passed = Math.abs(actualTimeMs - expectedTimeMs) <= tolerance;

        const result: TimingResult = {
            expectedTimeMs,
            actualTimeMs,
            tolerance,
            passed,
            operations: scheduler.getExecutionLog(),
        };

        console.log(`[TIMING-TEST] Actual time: ${actualTimeMs.toFixed(2)}ms`);
        console.log(`[TIMING-TEST] Tolerance: ±${tolerance.toFixed(2)}ms`);
        console.log(`[TIMING-TEST] Result: ${passed ? 'PASS' : 'FAIL'}`);

        if (!passed) {
            console.log(
                `[TIMING-TEST] Timing error: ${(actualTimeMs - expectedTimeMs).toFixed(2)}ms`,
            );
        }

        return result;
    }

    it('should execute sequential quarter notes with accurate timing', async () => {
        const result = await measureProgramTiming(
            'Sequential Notes',
            createSequentialNotesProgram,
            1500,
            'Three quarter notes in sequence',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1400); // At least 1.4s
        expect(result.actualTimeMs).toBeLessThan(1700); // At most 1.7s

        console.log('✅ Sequential notes timing verified');
    });

    it('should execute notes with forwards with accurate sequential timing', async () => {
        const result = await measureProgramTiming(
            'Notes with Forwards',
            createNotesWithForwardsProgram,
            3000, // 3 × 500ms notes + 3 × 500ms forwards
            'Three quarter notes each followed by forward',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(2800); // At least 2.8s
        expect(result.actualTimeMs).toBeLessThan(3300); // At most 3.3s

        console.log('✅ Notes with forwards timing verified');
    });

    it('should execute variable forwards with correct cumulative timing', async () => {
        const result = await measureProgramTiming(
            'Variable Forwards',
            createVariableForwardsProgram,
            3500, // 7 × 500ms forwards (5+10+15+25+35+50+85 steps, each taking 500ms)
            'Seven forward operations with increasing step values',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(3200); // At least 3.2s
        expect(result.actualTimeMs).toBeLessThan(3800); // At most 3.8s

        console.log('✅ Variable forwards timing verified');
    });

    it('should execute concurrent operations with overlapping timing', async () => {
        const result = await measureProgramTiming(
            'Concurrent Operations',
            createConcurrentNotesProgram,
            1500,
            'Three quarter notes with concurrent forward blocks',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1400);
        expect(result.actualTimeMs).toBeLessThan(1700);

        expect(result.actualTimeMs).toBeLessThan(2000);

        console.log('✅ Concurrent operations timing verified');
    });

    // ================== MULTI-THREADED TESTS ==================

    it('should execute multi-threaded sequential notes concurrently', async () => {
        const result = await measureProgramTiming(
            'Multi-Thread Sequential',
            createMultiThreadSequentialNotesProgram,
            1500, // Both threads run 3×500ms concurrently = 1.5s total
            'Two threads playing different note sequences simultaneously',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1400);
        expect(result.actualTimeMs).toBeLessThan(1700);

        console.log('✅ Multi-threaded sequential notes timing verified');
    });

    it('should execute multi-threaded mixed operations with synchronized completion', async () => {
        const result = await measureProgramTiming(
            'Multi-Thread Mixed',
            createMultiThreadMixedProgram,
            3000, // Both threads designed to complete in 3.0s
            'Two threads with different operations finishing simultaneously',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(2800);
        expect(result.actualTimeMs).toBeLessThan(3300);

        console.log('✅ Multi-threaded synchronized timing verified');
    });

    it('should execute multi-threaded async operations with different completion times', async () => {
        const result = await measureProgramTiming(
            'Multi-Thread Async',
            createMultiThreadAsyncProgram,
            1500, // Thread1: 1.0s, Thread2: 1.5s → total: 1.5s
            'Two threads with different completion times',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1300);
        expect(result.actualTimeMs).toBeLessThan(1800);

        console.log('✅ Multi-threaded async timing verified');
    });

    it('should execute nested operations with accurate compound timing', async () => {
        const result = await measureProgramTiming(
            'Nested Operations',
            createNestedOperationsProgram,
            1500, // 3 × 500ms compound operations
            'Note blocks with forwards nested inside them',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1300);
        expect(result.actualTimeMs).toBeLessThan(1800);

        console.log('✅ Nested operations compound timing verified');
    });

    // ================== COMPREHENSIVE NESTED PLUGIN TESTS ==================

    it('should execute mixed nested operations with different plugin types', async () => {
        const result = await measureProgramTiming(
            'Mixed Nested Operations',
            createMixedNestedOperationsProgram,
            1500, // 3 × 500ms notes with mixed nested operations
            'Notes with various plugin types nested inside',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(1300);
        expect(result.actualTimeMs).toBeLessThan(1800);

        console.log('✅ Mixed nested operations timing verified');
    });

    it('should maintain context isolation between nested and thread-level contexts', async () => {
        const result = await measureProgramTiming(
            'Context Isolation',
            createContextIsolationProgram,
            1000, // 2 × 500ms notes
            'Nested context changes isolated from thread context',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(900);
        expect(result.actualTimeMs).toBeLessThan(1200);

        console.log('✅ Context isolation timing verified');
    });

    it('should compress multiple blocking operations into note duration', async () => {
        const result = await measureProgramTiming(
            'Duration Compression',
            createDurationCompressionProgram,
            500, // 1 × 500ms note with compressed operations
            'Multiple blocking operations compressed within note duration',
        );

        expect(result.passed).toBe(true);
        expect(result.actualTimeMs).toBeGreaterThan(400);
        expect(result.actualTimeMs).toBeLessThan(700);

        console.log('✅ Duration compression timing verified');
    });
});
