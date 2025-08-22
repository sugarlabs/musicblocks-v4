import { ExecutionContext } from '../interpreter/execution-context';

/**
 * Thread Control Block (TCB) holds the complete state of a single thread,
 * including its unique execution context.
 */
export class ThreadControlBlock {
    constructor(
        public threadId: string,
        public context: ExecutionContext,
    ) {}
}
