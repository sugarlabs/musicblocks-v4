import { IRProgram } from '../interpreter/ir-program';
import { IRInterpreter } from '../interpreter/interpreter';
import { ThreadControlBlock } from './thread-control-block';
import { ExecutionContext } from '../interpreter/execution-context';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExternalFunction = (...args: any[]) => any;

export type ExecutionStatus =
    | { status: 'COMPLETED_SLICE' }
    | { status: 'BLOCKED_ON_TIME'; duration: number }
    | { status: 'BLOCKED_ON_IO'; duration?: number }
    | { status: 'BLOCKED_ON_EVENT'; eventType?: string }
    | { status: 'THREAD_HALTED' };

/**
 * The Scheduler manages multiple concurrent threads using cooperative multitasking.
 * It maintains four specialized queues to manage different thread states:
 * - runQueue: Threads ready for immediate execution
 * - waitQueue: Threads blocked on time-based delays
 * - ioQueue: Threads blocked on I/O operations or external functions
 * - eventQueue: Threads blocked waiting for specific events
 *
 * Uses round-robin scheduling with cooperative multitasking to execute
 * small slices of instructions from each thread.
 */
export class Scheduler {
    private interpreter: IRInterpreter;
    private tcbMap: Map<string, ThreadControlBlock> = new Map();
    private runQueue: ThreadControlBlock[] = [];
    private waitQueue: { tcb: ThreadControlBlock; wakeUpTime: number }[] = [];
    private ioQueue: { tcb: ThreadControlBlock; blockTime: number }[] = [];
    private eventQueue: { tcb: ThreadControlBlock; eventType?: string; blockTime: number }[] = [];
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
        this.ioQueue.length = 0;
        this.eventQueue.length = 0;

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

        // Process all specialized queues to move ready threads back to run queue
        this.processWaitQueue();
        this.processIOQueue();
        this.processEventQueue();

        // Check if there are any threads to run
        if (this.runQueue.length === 0) {
            // If no threads are ready to run, schedule next check and return
            setImmediate(() => this.mainLoop());
            return;
        }

        // Dequeue the first TCB from the run queue
        const tcb = this.runQueue.shift()!;

        // Execute a slice of instructions for this thread
        const result = this.interpreter.executeSlice(tcb.context, 5);

        // Handle the result based on execution status
        this.handleExecutionResult(tcb, result);

        // Schedule the next iteration of the main loop
        setImmediate(() => this.mainLoop());
    }

    /**
     * Process the wait queue and move threads that are ready back to the run queue.
     */
    private processWaitQueue(): void {
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
    }

    /**
     * Process the I/O queue and move threads that should be retried back to the run queue.
     */
    private processIOQueue(): void {
        const currentTime = Date.now();
        const readyToRetry: { tcb: ThreadControlBlock; blockTime: number }[] = [];
        const stillBlocked: { tcb: ThreadControlBlock; blockTime: number }[] = [];

        for (const blockedThread of this.ioQueue) {
            // For I/O operations, we can implement a retry mechanism or timeout
            // For now, we'll retry I/O operations after a short delay (100ms)
            if (currentTime - blockedThread.blockTime >= 100) {
                readyToRetry.push(blockedThread);
            } else {
                stillBlocked.push(blockedThread);
            }
        }

        // Move ready threads back to run queue for retry
        for (const readyThread of readyToRetry) {
            this.runQueue.push(readyThread.tcb);
        }
        this.ioQueue = stillBlocked;
    }

    /**
     * Process the event queue and move threads that should be retried back to the run queue.
     */
    private processEventQueue(): void {
        const currentTime = Date.now();
        const readyToRetry: {
            tcb: ThreadControlBlock;
            eventType?: string;
            blockTime: number;
        }[] = [];
        const stillBlocked: {
            tcb: ThreadControlBlock;
            eventType?: string;
            blockTime: number;
        }[] = [];

        for (const blockedThread of this.eventQueue) {
            // For event operations, we implement a timeout mechanism
            // Events are retried after 500ms if not resolved
            if (currentTime - blockedThread.blockTime >= 500) {
                readyToRetry.push(blockedThread);
            } else {
                stillBlocked.push(blockedThread);
            }
        }

        // Move ready threads back to run queue for retry
        for (const readyThread of readyToRetry) {
            this.runQueue.push(readyThread.tcb);
        }
        this.eventQueue = stillBlocked;
    }

    /**
     * Handle the execution result and place the thread in the appropriate queue.
     */
    private handleExecutionResult(tcb: ThreadControlBlock, result: ExecutionStatus): void {
        switch (result.status) {
            case 'COMPLETED_SLICE':
                // Put the thread back at the end of the run queue
                this.runQueue.push(tcb);
                break;

            case 'THREAD_HALTED':
                // Thread is finished, don't put it back in any queue
                this.tcbMap.delete(tcb.threadId);
                break;

            case 'BLOCKED_ON_TIME': {
                // Thread is blocked waiting for time, move to wait queue
                const wakeUpTime = Date.now() + result.duration;
                this.waitQueue.push({ tcb, wakeUpTime });
                break;
            }

            case 'BLOCKED_ON_IO':
                // Thread is blocked on I/O operation, move to I/O queue
                this.ioQueue.push({ tcb, blockTime: Date.now() });
                break;

            case 'BLOCKED_ON_EVENT':
                // Thread is blocked waiting for event, move to event queue
                this.eventQueue.push({
                    tcb,
                    eventType: result.eventType,
                    blockTime: Date.now(),
                });
                break;

            default:
                // Should never reach here, but put back in run queue as fallback
                this.runQueue.push(tcb);
                break;
        }
    }
}
