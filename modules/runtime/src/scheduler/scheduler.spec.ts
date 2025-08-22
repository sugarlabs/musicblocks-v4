import { describe, it, expect } from 'vitest';
import { Scheduler } from './scheduler';
import { ThreadControlBlock } from './thread-control-block';
import { ExecutionContext } from '../interpreter/execution-context';
import { IRProgram } from '../interpreter/ir-program';
import { IRFunction } from '../interpreter/ir-function';
import { IRBasicBlock } from '../interpreter/ir-basic-block';
import { CallInstruction } from '../interpreter/instructions/call-instruction';

describe('Scheduler', () => {
    it('should be instantiated correctly', () => {
        const scheduler = new Scheduler();
        expect(scheduler).toBeInstanceOf(Scheduler);
    });

    it('should register external functions', () => {
        const scheduler = new Scheduler();
        const mockFunction = () => 'mock result';

        scheduler.registerExternalFunction('testFunc', mockFunction);
        expect(() => scheduler.registerExternalFunction('testFunc', mockFunction)).not.toThrow();
    });

    it('should start and stop without error', () => {
        const scheduler = new Scheduler();
        expect(() => scheduler.start()).not.toThrow();
        expect(() => scheduler.stop()).not.toThrow();
    });

    it('should load a program and populate the run queue', () => {
        const scheduler = new Scheduler();
        const functions = new Map();

        const start1Function = new IRFunction('start1', [
            new IRBasicBlock('entry', [new CallInstruction('Clear', [])]),
        ]);
        const start2Function = new IRFunction('start2', [
            new IRBasicBlock('entry', [new CallInstruction('PlayNote', ['C4', 0.25])]),
        ]);
        const regularFunction = new IRFunction('action1', [
            new IRBasicBlock('entry', [new CallInstruction('Forward', [50])]),
        ]);

        functions.set('start1', start1Function);
        functions.set('start2', start2Function);
        functions.set('action1', regularFunction);

        const program = new IRProgram(functions);
        scheduler.load(program);

        const runQueue = scheduler['runQueue'];
        expect(runQueue.length).toBe(2);

        const threadIds = runQueue.map((tcb) => tcb.threadId);
        expect(threadIds).toContain('start1');
        expect(threadIds).toContain('start2');
        expect(threadIds).not.toContain('action1');

        const start1Tcb = runQueue.find((tcb) => tcb.threadId === 'start1')!;
        expect(start1Tcb.context.instructionPointer.functionName).toBe('start1');
        expect(start1Tcb.context.instructionPointer.blockLabel).toBe('entry');
        expect(start1Tcb.context.instructionPointer.instructionIndex).toBe(0);
    });

    it('should run a simple program with multiple threads', async () => {
        const scheduler = new Scheduler();

        // Register external functions that the program uses
        scheduler.registerExternalFunction('Clear', () => undefined);
        scheduler.registerExternalFunction('Forward', () => undefined);
        scheduler.registerExternalFunction('PlayNote', () => undefined);

        const functions = new Map();

        const start1Function = new IRFunction('start1', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new CallInstruction('Forward', [10]),
            ]),
        ]);
        const start2Function = new IRFunction('start2', [
            new IRBasicBlock('entry', [new CallInstruction('PlayNote', ['C4', 0.25])]),
        ]);

        functions.set('start1', start1Function);
        functions.set('start2', start2Function);

        const program = new IRProgram(functions);
        scheduler.load(program);
        scheduler.start();

        await new Promise<void>((resolve) => {
            const checkQueues = () => {
                const runQueue = scheduler['runQueue'];
                const waitQueue = scheduler['waitQueue'];
                if (runQueue.length === 0 && waitQueue.length === 0) {
                    scheduler.stop();
                    resolve();
                } else {
                    setTimeout(checkQueues, 10);
                }
            };
            checkQueues();
        });

        expect(scheduler['runQueue'].length).toBe(0);
        expect(scheduler['waitQueue'].length).toBe(0);
    });

    it('should handle blocking operations with time-based waiting', async () => {
        const scheduler = new Scheduler();

        // Register external functions that the program uses
        scheduler.registerExternalFunction('Clear', () => undefined);
        scheduler.registerExternalFunction('playNote', (duration: number) => {
            return { type: 'time', duration: duration };
        });

        const functions = new Map();

        const start1Function = new IRFunction('start1', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new CallInstruction('playNote', [100]),
            ]),
        ]);

        functions.set('start1', start1Function);

        const program = new IRProgram(functions);
        scheduler.load(program);
        scheduler.start();

        // Allow some execution time
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(scheduler['waitQueue'].length).toBe(1);

        // Wait for the blocking operation to complete
        await new Promise<void>((resolve) => {
            const checkQueues = () => {
                const waitQueue = scheduler['waitQueue'];
                if (waitQueue.length === 0) {
                    scheduler.stop();
                    resolve();
                } else {
                    setTimeout(checkQueues, 10);
                }
            };
            setTimeout(checkQueues, 150);
        });

        expect(scheduler['waitQueue'].length).toBe(0);
        expect(scheduler['runQueue'].length).toBe(0);
    });
});

describe('ThreadControlBlock', () => {
    it('should be instantiated correctly', () => {
        const functions = new Map();
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        const tcb = new ThreadControlBlock('thread-1', context);

        expect(tcb).toBeInstanceOf(ThreadControlBlock);
        expect(tcb.threadId).toBe('thread-1');
        expect(tcb.context).toBe(context);
    });
});

describe('Refactored IRInterpreter', () => {
    it('should execute a slice of instructions', () => {
        const functions = new Map();

        const testFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [
                new CallInstruction('Clear', []),
                new CallInstruction('PlayNote', ['C4', 0.25]),
                new CallInstruction('Forward', [50]),
            ]),
        ]);

        functions.set('start2', testFunction);
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        context.instructionPointer = {
            functionName: 'start2',
            blockLabel: 'entry',
            instructionIndex: 0,
        };

        const scheduler = new Scheduler();
        const result = scheduler['interpreter'].executeSlice(context, 2);

        expect(result.status).toBe('COMPLETED_SLICE');
        expect(context.instructionPointer.instructionIndex).toBe(2);
        expect(context.isHalted).toBe(false);
    });

    it('should halt when thread completes', () => {
        const functions = new Map();

        const testFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [new CallInstruction('Clear', [])]),
        ]);

        functions.set('start2', testFunction);
        const program = new IRProgram(functions);
        const context = new ExecutionContext(program);

        context.instructionPointer = {
            functionName: 'start2',
            blockLabel: 'entry',
            instructionIndex: 0,
        };

        const scheduler = new Scheduler();
        const result = scheduler['interpreter'].executeSlice(context, 10);

        expect(result.status).toBe('THREAD_HALTED');
        expect(context.isHalted).toBe(true);
    });

    it('should detect blocking operations', () => {
        const functions = new Map();

        const testFunction = new IRFunction('start2', [
            new IRBasicBlock('entry', [new CallInstruction('playNote', [500])]),
        ]);

        functions.set('start2', testFunction);
        const program = new IRProgram(functions);

        const scheduler = new Scheduler();
        scheduler.registerExternalFunction('playNote', (duration: number) => {
            return { type: 'time', duration: duration };
        });

        // Create context using the scheduler's external function registry
        const context = new ExecutionContext(
            program,
            scheduler['interpreter']['externalFunctions'],
        );

        context.instructionPointer = {
            functionName: 'start2',
            blockLabel: 'entry',
            instructionIndex: 0,
        };

        const result = scheduler['interpreter'].executeSlice(context, 10);

        expect(result.status).toBe('BLOCKED_ON_TIME');
        if (result.status === 'BLOCKED_ON_TIME') {
            expect(result.duration).toBe(500);
        }
    });
});
