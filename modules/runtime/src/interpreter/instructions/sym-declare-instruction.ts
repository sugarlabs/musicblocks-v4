import { IRInstruction } from './ir-instruction';
import { ExecutionContext } from '../execution-context';
import { SymbolType, DataType } from '../../@types/symbol-types';

/**
 * SymDeclareInstruction: Declares a variable in the current scope.
 */
export class SymDeclareInstruction extends IRInstruction {
    constructor(public variableName: string) {
        super();
    }

    execute(context: ExecutionContext): void {
        const symbolTable = context.getCurrentSymbolTable();

        symbolTable.declare(this.variableName, SymbolType.USER_VARIABLE, DataType.ANY, {
            isMutable: true,
        });
    }
}
