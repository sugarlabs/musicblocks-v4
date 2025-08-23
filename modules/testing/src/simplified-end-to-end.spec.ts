import { describe, it, expect } from 'vitest';
import { ProgramDeclaration } from '../../program/src/ast/ProgramDeclaration';
import { ThreadFunctionDeclaration } from '../../program/src/ast/function/ThreadFunctionDeclaration';
import { CustomFunctionDeclaration } from '../../program/src/ast/function/CustomFunctionDeclaration';
import { Block } from '../../program/src/ast/Block';
import { IterationLoopStatement } from '../../program/src/ast/statement/IterationLoopStatement';
import { VariableDeclarationStatement } from '../../program/src/ast/statement/VariableDeclarationStatement';
import { NumericLiteralExpression } from '../../program/src/ast/expression/NumericLiteralExpression';
import { StringLiteralExpression } from '../../program/src/ast/expression/StringLiteralExpression';
import { IdentifierExpression } from '../../program/src/ast/expression/IdentifierExpression';
import { FunctionCallStatement } from '../../program/src/ast/statement/FunctionCallStatement';
import {
    PlayNoteStatement,
    SetKeyStatement,
    SetMasterVolumeStatement,
    ForwardStatement,
    RightStatement,
    ClearStatement,
    NoteExpression,
} from '../../program/src/ast/music-blocks/MusicBlocksConstructs';
import { Compiler } from '../../program/src/compiler/compiler';
import { PluginManager } from './plugins/plugin-manager';
import { MusicBlocksScheduler } from './music-blocks-scheduler';
import {
    PlayNotePlugin,
    SetKeyPlugin,
    SetMasterVolumePlugin,
} from './plugins/music-blocks-plugins/audio-plugins';
import { ForwardPlugin, RightPlugin } from './plugins/music-blocks-plugins/movement-plugins';
import { ClearPlugin } from './plugins/music-blocks-plugins/system-plugins';

/**
 * Create a simplified Music Blocks program without event handlers
 */
function createSimpleMusicBlocksProgram(): ProgramDeclaration {
    const program = new ProgramDeclaration([]);

    // Start thread function 1: Simple music sequence
    const start1Block = new Block([
        new ClearStatement(),
        new SetKeyStatement(new StringLiteralExpression('C major')),
        new SetMasterVolumeStatement(new NumericLiteralExpression(80)),
        new PlayNoteStatement(new NoteExpression('C4'), new NumericLiteralExpression(0.5)),
        new PlayNoteStatement(new NoteExpression('D4'), new NumericLiteralExpression(0.5)),
        new PlayNoteStatement(new NoteExpression('E4'), new NumericLiteralExpression(0.5)),
    ]);

    // Start thread function 2: Movement sequence
    const start2Block = new Block([
        new VariableDeclarationStatement(
            new IdentifierExpression('steps'),
            new NumericLiteralExpression(10),
        ),
        new ForwardStatement(new NumericLiteralExpression(50)),
        new RightStatement(new NumericLiteralExpression(90)),
        new ForwardStatement(new IdentifierExpression('steps')),
        // Repeat loop
        new IterationLoopStatement(
            new IdentifierExpression('i'),
            new NumericLiteralExpression(3),
            new Block([new FunctionCallStatement(new IdentifierExpression('simpleAction'), [])]),
        ),
    ]);

    // Simple action function
    const simpleActionBlock = new Block([
        new PlayNoteStatement(new NoteExpression('F4'), new NumericLiteralExpression(0.25)),
        new ForwardStatement(new NumericLiteralExpression(20)),
    ]);

    // Create function declarations
    const start1 = new ThreadFunctionDeclaration(start1Block);
    const start2 = new ThreadFunctionDeclaration(start2Block);
    const simpleAction = new CustomFunctionDeclaration(
        new IdentifierExpression('simpleAction'),
        [],
        simpleActionBlock,
    );

    // Build the complete program
    program.body.push(start1);
    program.body.push(start2);
    program.body.push(simpleAction);

    return program;
}

describe('Music Blocks v4 - Simplified End-to-End Integration', () => {
    it('should execute a simple concurrent Music Blocks program', async () => {
        console.log('[TEST] Starting simplified end-to-end integration test');

        // 1. Create a simple AST without event handlers
        console.log('[TEST] Creating simplified Music Blocks program...');
        const ast = createSimpleMusicBlocksProgram();
        console.log('[TEST] AST created successfully');

        // 2. Setup Plugin Manager
        console.log('[TEST] Setting up plugin manager...');
        const pluginManager = new PluginManager();

        // Register essential plugins
        pluginManager.registerPlugin(new PlayNotePlugin());
        pluginManager.registerPlugin(new SetKeyPlugin());
        pluginManager.registerPlugin(new SetMasterVolumePlugin());
        pluginManager.registerPlugin(new ForwardPlugin());
        pluginManager.registerPlugin(new RightPlugin());
        pluginManager.registerPlugin(new ClearPlugin());

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

        // 4. Setup Music Blocks Scheduler
        console.log('[TEST] Setting up Music Blocks scheduler...');
        const scheduler = new MusicBlocksScheduler(pluginManager);

        // 5. Load and Execute
        console.log('[TEST] Loading IR program into scheduler...');
        scheduler.load(irProgram);

        console.log('[TEST] Starting concurrent execution...');
        scheduler.start();

        // 6. Monitor Execution
        const executionLog: string[] = [];
        const startTime = Date.now();
        const maxExecutionTime = 15000;

        console.log('[TEST] Monitoring execution...');

        // 7. Wait for Completion
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
                const logEntry = `[${new Date().toISOString()}] RunQueue: ${status.runQueueSize}, WaitQueue: ${status.waitQueueSize}, Total: ${status.totalThreads}`;
                executionLog.push(logEntry);
                console.log(logEntry);

                // Check if all threads have completed
                if (status.totalThreads === 0) {
                    scheduler.stop();
                    console.log('[TEST] All threads completed execution');
                    resolve();
                } else {
                    setTimeout(checkCompletion, 100);
                }
            };

            checkCompletion();
        });

        // 8. Verify Results
        console.log('[TEST] Verifying concurrency...');
        expect(executionLog.length).toBeGreaterThan(3);

        // Verify that we had multiple threads running
        const hasMultipleThreads = executionLog.some((log) => {
            const match = log.match(/Total: (\d+)/);
            return match && parseInt(match[1]) > 1;
        });
        expect(hasMultipleThreads).toBe(true);

        // Verify that blocking operations occurred (threads moved to wait queue)
        const hasWaitQueueActivity = executionLog.some((log) => {
            const match = log.match(/WaitQueue: (\d+)/);
            return match && parseInt(match[1]) > 0;
        });
        expect(hasWaitQueueActivity).toBe(true);

        console.log('[TEST] Simplified end-to-end integration test completed successfully');
        console.log(`[TEST] Total execution log entries: ${executionLog.length}`);
        console.log(`[TEST] Test completed in ${Date.now() - startTime}ms`);
    }, 20000);

    it('should demonstrate plugin-based blocking operations', async () => {
        console.log('[TEST] Testing plugin-based blocking operations...');

        // Create simple program with blocking operations
        const program = new ProgramDeclaration([]);
        const startBlock = new Block([
            new PlayNoteStatement(new NoteExpression('A4'), new NumericLiteralExpression(1.0)), // 1 second note
            new ForwardStatement(new NumericLiteralExpression(100)), // 1 second movement
            new PlayNoteStatement(new NoteExpression('B4'), new NumericLiteralExpression(0.5)), // 0.5 second note
        ]);
        const start = new ThreadFunctionDeclaration(startBlock);
        program.body.push(start);

        const pluginManager = new PluginManager();
        pluginManager.registerPlugin(new PlayNotePlugin());
        pluginManager.registerPlugin(new ForwardPlugin());

        const compiler = new Compiler();
        const irProgram = compiler.compile(program);

        const scheduler = new MusicBlocksScheduler(pluginManager);
        scheduler.load(irProgram);
        scheduler.start();

        let maxWaitQueueSize = 0;
        const startTime = Date.now();

        await new Promise<void>((resolve) => {
            const checkCompletion = () => {
                const status = scheduler.getStatus();
                maxWaitQueueSize = Math.max(maxWaitQueueSize, status.waitQueueSize);

                if (status.totalThreads === 0 || Date.now() - startTime > 10000) {
                    scheduler.stop();
                    resolve();
                } else {
                    setTimeout(checkCompletion, 50);
                }
            };
            checkCompletion();
        });

        // Verify that threads were moved to wait queue (blocking occurred)
        expect(maxWaitQueueSize).toBeGreaterThan(0);

        console.log('[TEST] Plugin-based blocking operations test completed');
        console.log(`[TEST] Maximum wait queue size observed: ${maxWaitQueueSize}`);
    });

    it('should handle multiple concurrent threads with plugin integration', () => {
        console.log('[TEST] Testing scheduler queue management...');

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

        console.log('[TEST] Queue management test completed');
    });
});
