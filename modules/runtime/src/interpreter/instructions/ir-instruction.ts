import { ExecutionContext } from '../execution-context';

/**
 * Base class for all IR instructions.
 */
export abstract class IRInstruction {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public metadata: { sourceLine?: number; [key: string]: any } = {};

    abstract execute(context: ExecutionContext): void;
}
