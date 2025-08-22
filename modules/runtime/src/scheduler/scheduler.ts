import { IRProgram } from '../interpreter/ir-program';
import { IRInterpreter } from '../interpreter/interpreter';
import { ThreadControlBlock } from './thread-control-block';
import { ExecutionContext } from '../interpreter/execution-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExternalFunction = (...args: any[]) => any;

export type ExecutionStatus =
    | { status: 'COMPLETED_SLICE' }
    | { status: 'BLOCKED_ON_TIME'; duration: number }
    | { status: 'THREAD_HALTED' };

/**
 * The Scheduler manages multiple concurrent threads using cooperative multitasking.
 * It maintains a run queue and wait queue to manage thread states and executes
 * small slices of instructions from each thread in round-robin fashion.
 */
export class Scheduler {
    private interpreter: IRInterpreter;
    private tcbMap: Map<string, ThreadControlBlock> = new Map();
    private runQueue: ThreadControlBlock[] = [];
    private waitQueue: { tcb: ThreadControlBlock; wakeUpTime: number }[] = [];
    private functionRegistry: Map<string, ExternalFunction> = new Map();
    private isRunning: boolean = false;

    constructor() {
        // Create interpreter with the function registry
        this.interpreter = new IRInterpreter(this.functionRegistry);
    }

    public load(program: IRProgram): void {
        // Creates a TCB for each 'start' function in the IRProgram
        // and adds it to the runQueue.
        this.tcbMap.clear();
        this.runQueue.length = 0;
        this.waitQueue.length = 0;

        for (const [functionName, irFunction] of program.functions) {
            if (functionName.startsWith('start')) {
                const context = new ExecutionContext(
                    program,
                    this.interpreter['externalFunctions'],
                );
                context.instructionPointer = {
                    functionName: functionName,
                    blockLabel: irFunction.blocks[0].label,
                    instructionIndex: 0,
                };

                const tcb = new ThreadControlBlock(functionName, context);
                this.tcbMap.set(functionName, tcb);
                this.runQueue.push(tcb);
            }
        }
    }

    public registerExternalFunction(name: string, handler: ExternalFunction): void {
        this.functionRegistry.set(name, handler);

        // Also register in the interpreter if it has registerFunction method
        if (
            this.interpreter['externalFunctions'] &&
            this.interpreter['externalFunctions'].registerFunction
        ) {
            this.interpreter['externalFunctions'].registerFunction(name, handler);
        }
    }

    public start(): void {
        this.isRunning = true;
        this.mainLoop();
    }

    public stop(): void {
        this.isRunning = false;
    }

    private mainLoop(): void {
        // The core logic of the scheduler as described in the architecture.
        // Use setImmediate() or Promise.resolve() to prevent blocking the Node.js event loop.
        if (!this.isRunning) {
            return;
        }

        // Check the wait queue and move threads that are ready back to the run queue
        const currentTime = Date.now();
        const readyToRun: { tcb: ThreadControlBlock; wakeUpTime: number }[] = [];
        const stillWaiting: { tcb: ThreadControlBlock; wakeUpTime: number }[] = [];

        for (const waitingThread of this.waitQueue) {
            if (waitingThread.wakeUpTime <= currentTime) {
                readyToRun.push(waitingThread);
            } else {
                stillWaiting.push(waitingThread);
            }
        }

        // Move ready threads back to run queue
        for (const readyThread of readyToRun) {
            this.runQueue.push(readyThread.tcb);
        }
        this.waitQueue = stillWaiting;

        // Check if there are any threads to run
        if (this.runQueue.length === 0) {
            // If no threads are ready to run, schedule next check and return
            setImmediate(() => this.mainLoop());
            return;
        }

        // Dequeue the first TCB from the run queue
        const tcb = this.runQueue.shift()!;

        // Execute a slice of instructions for this thread
        const result = this.interpreter.executeSlice(tcb.context, 5); // Execute 5 instructions at a time

        // Handle the result
        if (result.status === 'COMPLETED_SLICE') {
            // Put the thread back at the end of the run queue
            this.runQueue.push(tcb);
        } else if (result.status === 'THREAD_HALTED') {
            // Thread is finished, don't put it back in any queue
            this.tcbMap.delete(tcb.threadId);
        } else if (result.status === 'BLOCKED_ON_TIME') {
            // Thread is blocked waiting for time, move to wait queue
            const wakeUpTime = Date.now() + result.duration;
            this.waitQueue.push({ tcb, wakeUpTime });
        }

        // Schedule the next iteration of the main loop
        setImmediate(() => this.mainLoop());
    }
}
