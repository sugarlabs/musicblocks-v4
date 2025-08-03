import { SymbolTable } from '../execution/scope/symbol-table';

/**
 * StackFrame holds the local scope for a function call and the return address.
 */
export class StackFrame {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public returnValue: any = null;

    constructor(
        public functionName: string,
        public localScope: SymbolTable,
        public returnAddress: {
            functionName: string;
            blockLabel: string;
            instructionIndex: number;
        },
    ) {}
}
