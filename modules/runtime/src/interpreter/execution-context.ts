import { IRProgram } from './ir-program';
import { StackFrame } from './stack-frame';
import { SimpleValueStore } from './testing/mock-program';
import { SymbolTable } from '../execution/scope/symbol-table';

/**
 * ExecutionContext holds the full state of the interpreter at any moment.
 */
export class ExecutionContext {
    public instructionPointer: {
        functionName: string;
        blockLabel: string;
        instructionIndex: number;
    };
    public callStack: StackFrame[] = [];
    public isHalted: boolean = false;
    public valueStore: SimpleValueStore = new SimpleValueStore();
    public globalSymbolTable: SymbolTable = new SymbolTable();

    constructor(public program: IRProgram) {
        this.instructionPointer = {
            functionName: '',
            blockLabel: '',
            instructionIndex: 0,
        };
    }

    /**
     * Get the current symbol table (either from current stack frame or global).
     */
    getCurrentSymbolTable(): SymbolTable {
        if (this.callStack.length > 0) {
            return this.callStack[this.callStack.length - 1].localScope;
        }
        return this.globalSymbolTable;
    }

    /**
     * Get current instruction pointer as a readable string.
     */
    getInstructionPointerString(): string {
        const { functionName, blockLabel, instructionIndex } = this.instructionPointer;
        return `${functionName}:${blockLabel}[${instructionIndex}]`;
    }
}
