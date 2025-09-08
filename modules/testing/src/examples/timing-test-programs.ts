import { ProgramDeclaration } from '../../../program/src/ast/ProgramDeclaration';
import { ThreadFunctionDeclaration } from '../../../program/src/ast/function/ThreadFunctionDeclaration';
import { Block } from '../../../program/src/ast/Block';
import { FunctionCallStatement } from '../../../program/src/ast/statement/FunctionCallStatement';
import { IdentifierExpression } from '../../../program/src/ast/expression/IdentifierExpression';
import { StringLiteralExpression } from '../../../program/src/ast/expression/StringLiteralExpression';
import { NumericLiteralExpression } from '../../../program/src/ast/expression/NumericLiteralExpression';

/**
 * Helper to create function call arguments in the proper format
 */
function createArgs(args: { param: string; value: string | number | unknown }[]) {
    return args.map((arg) => ({
        param: new IdentifierExpression(arg.param),
        value:
            typeof arg.value === 'string'
                ? new StringLiteralExpression(arg.value)
                : typeof arg.value === 'number'
                  ? new NumericLiteralExpression(arg.value)
                  : new StringLiteralExpression(JSON.stringify(arg.value)),
    }));
}

/**
 * Helper to create nested operations array for compound note blocks
 */
function createNestedOperations(operations: { name: string; args: unknown[] }[]) {
    return operations;
}

/**
 * Scenario 1: Sequential Quarter Notes
 * 3 quarter notes played one after another
 * Expected time: ~1.5s (3 × 500ms)
 */
export function createSequentialNotesProgram(): ProgramDeclaration {
    const start1Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(start1Block)]);
}

/**
 * Scenario 2: Notes with Sequential Forwards
 * Play note (500ms) + forward (500ms) + play note (500ms) + forward (500ms) + play note (500ms) + forward (500ms)
 * Expected time: ~3s
 */
export function createNotesWithForwardsProgram(): ProgramDeclaration {
    const start2Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(start2Block)]);
}

/**
 * Scenario 3: Variable Forward Operations
 * Seven forward operations with different step counts (but each takes 500ms)
 * Expected time: ~3.5s (7 × 500ms forwards)
 */
export function createVariableForwardsProgram(): ProgramDeclaration {
    const start3Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 5 }]),
        ), // 100ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ), // 200ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 15 }]),
        ), // 300ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 25 }]),
        ), // 500ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 35 }]),
        ), // 700ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 50 }]),
        ), // 1000ms
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 85 }]),
        ), // 1700ms
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(start3Block)]);
}

/**
 * Scenario 4: Concurrent Note and Movement Operations
 * Uses nested operations within note blocks to test concurrent timing
 * Expected time: ~1.5s (3 × 500ms concurrent operations)
 */
export function createConcurrentNotesProgram(): ProgramDeclaration {
    const start4Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([{ name: 'forward', args: [10] }]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([{ name: 'forward', args: [10] }]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([{ name: 'forward', args: [10] }]),
                },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(start4Block)]);
}

/**
 * Get all timing test programs as a collection
 */
export function getTimingTestPrograms() {
    return {
        sequential: createSequentialNotesProgram,
        withForwards: createNotesWithForwardsProgram,
        variableForwards: createVariableForwardsProgram,
        concurrent: createConcurrentNotesProgram,
    };
}

// ================== MULTI-THREADED VERSIONS ==================

/**
 * Multi-threaded Scenario 1: Two threads playing sequential notes simultaneously
 * Thread 1: C4-D4-E4 (1.5s)
 * Thread 2: F4-G4-A4 (1.5s)
 * Expected time: ~1.5s (both threads run concurrently)
 */
export function createMultiThreadSequentialNotesProgram(): ProgramDeclaration {
    const thread1Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
    ]);

    const thread2Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'F4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'G4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'A4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
    ]);

    return new ProgramDeclaration([
        new ThreadFunctionDeclaration(thread1Block),
        new ThreadFunctionDeclaration(thread2Block),
    ]);
}

/**
 * Multi-threaded Scenario 2: Two threads with different timing patterns
 * Thread 1: 3 notes with forwards (3.0s)
 * Thread 2: 6 forwards only (3.0s)
 * Expected time: ~3.0s (both threads finish at same time)
 */
export function createMultiThreadMixedProgram(): ProgramDeclaration {
    const thread1Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
    ]);

    const thread2Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 5 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 15 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 20 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 25 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 30 }]),
        ),
    ]);

    return new ProgramDeclaration([
        new ThreadFunctionDeclaration(thread1Block),
        new ThreadFunctionDeclaration(thread2Block),
    ]);
}

/**
 * Multi-threaded Scenario 3: Different thread completion times
 * Thread 1: 2 notes (1.0s)
 * Thread 2: 3 forwards (1.5s)
 * Expected time: ~1.5s (longer thread determines total time)
 */
export function createMultiThreadAsyncProgram(): ProgramDeclaration {
    const thread1Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
    ]);

    const thread2Block = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 10 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 15 }]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('forward'),
            createArgs([{ param: 'steps', value: 20 }]),
        ),
    ]);

    return new ProgramDeclaration([
        new ThreadFunctionDeclaration(thread1Block),
        new ThreadFunctionDeclaration(thread2Block),
    ]);
}

/**
 * Get all multi-threaded timing test programs
 */
export function getMultiThreadTimingTestPrograms() {
    return {
        multiSequential: createMultiThreadSequentialNotesProgram,
        multiMixed: createMultiThreadMixedProgram,
        multiAsync: createMultiThreadAsyncProgram,
    };
}

// ================== COMPREHENSIVE NESTED OPERATIONS TESTS ==================

/**
 * Nested Operations Test: Note blocks with forward operations inside them
 * Each note block contains forwards that execute during the note's duration
 * Expected time: ~1.5s (3 × 500ms compound operations)
 */
export function createNestedOperationsProgram(): ProgramDeclaration {
    const nestedBlock = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'forward', args: [5] },
                        { name: 'forward', args: [10] },
                    ]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([{ name: 'forward', args: [15] }]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'forward', args: [20] },
                        { name: 'forward', args: [25] },
                        { name: 'forward', args: [30] },
                    ]),
                },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(nestedBlock)]);
}

/**
 * Mixed Nested Operations Test: Note blocks with various plugin types nested inside
 * Tests immediate, context, blocking, and event plugins within notes
 * Expected time: ~1.5s (3 × 500ms compound operations)
 */
export function createMixedNestedOperationsProgram(): ProgramDeclaration {
    const mixedNestedBlock = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'forward', args: [10] }, // Blocking
                        { name: 'setContext_instrument', args: ['guitar'] }, // Context
                        { name: 'clear', args: [] }, // Immediate
                    ]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'right', args: [90] }, // Blocking (compressed from 1000ms to fit)
                        { name: 'setKey', args: ['G'] }, // Immediate
                        { name: 'scalarStep', args: [2] }, // Immediate
                    ]),
                },
            ]),
        ),
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'E4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'left', args: [45] }, // Blocking (compressed)
                        { name: 'setContext_volume', args: [80] }, // Context
                        { name: 'forward', args: [15] }, // Blocking
                        { name: 'setMasterVolume', args: [90] }, // Immediate
                        { name: 'onNoteDo', args: ['callback1'] }, // Event (thread-scoped)
                    ]),
                },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(mixedNestedBlock)]);
}

/**
 * Context Isolation Test: Verify that nested context changes don't affect thread context
 * Expected time: ~1.0s (2 × 500ms operations)
 */
export function createContextIsolationProgram(): ProgramDeclaration {
    const contextBlock = new Block([
        // First note: Set thread-level context
        new FunctionCallStatement(
            new IdentifierExpression('setContext_instrument'),
            createArgs([{ param: 'value', value: 'piano' }]),
        ),
        // Note with nested context changes (should be isolated)
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'setContext_instrument', args: ['violin'] }, // Note-scoped
                        { name: 'setContext_volume', args: [120] }, // Note-scoped
                    ]),
                },
            ]),
        ),
        // Second note: Should use thread context (piano), not note context (violin)
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'D4' },
                { param: 'duration', value: 0.25 },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(contextBlock)]);
}

/**
 * Duration Compression Test: Multiple blocking operations compressed into note duration
 * Expected time: ~0.5s (1 × 500ms note with compressed operations)
 */
export function createDurationCompressionProgram(): ProgramDeclaration {
    const compressionBlock = new Block([
        new FunctionCallStatement(
            new IdentifierExpression('playNote'),
            createArgs([
                { param: 'pitch', value: 'C4' },
                { param: 'duration', value: 0.25 },
                { param: 'volume', value: 100 },
                {
                    param: 'nestedOperations',
                    value: createNestedOperations([
                        { name: 'forward', args: [20] }, // 125ms (compressed from 500ms)
                        { name: 'right', args: [90] }, // 125ms (compressed from 1000ms)
                        { name: 'forward', args: [30] }, // 125ms (compressed from 500ms)
                        { name: 'left', args: [45] }, // 125ms (compressed from 1000ms)
                    ]),
                },
            ]),
        ),
    ]);

    return new ProgramDeclaration([new ThreadFunctionDeclaration(compressionBlock)]);
}
