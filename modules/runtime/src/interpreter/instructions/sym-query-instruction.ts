import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';

/**
 * SymQueryInstruction retrieves the value of a variable from the Symbol Table.
 * It looks up the variable in the current symbol table and stores the result
 * in the value store for further use.
 */
export class SymQueryInstruction extends IRInstruction {
    public variableName: string;
    public targetVariable?: string;

    constructor(variableName: string, targetVariable?: string) {
        super();
        this.variableName = variableName;
        this.targetVariable = targetVariable;
    }

    execute(context: ExecutionContext): void {
        // Get the current symbol table
        const symbolTable = context.getCurrentSymbolTable();

        // Look up the variable in the symbol table
        const lookupResult = symbolTable.lookup(this.variableName);

        if (!lookupResult) {
            throw new Error(`Variable '${this.variableName}' not found in symbol table`);
        }

        // Get the value from the value store using the variable name
        const value = context.valueStore.getValue(this.variableName);

        // If a target variable is specified, store the value there
        // Otherwise, the value remains available for other instructions to use
        if (this.targetVariable) {
            context.valueStore.setValue(this.targetVariable, value);
        }

        // Move to next instruction
        context.instructionPointer.instructionIndex++;
    }
}
