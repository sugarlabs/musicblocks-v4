import { Program, FunctionDeclaration, ASTNodeBase } from '../abstracts';
import { IRProgram } from '../../../runtime/src/interpreter/ir-program';
import { IRFunction } from '../../../runtime/src/interpreter/ir-function';
import { Parser } from './parser';

export class Compiler {
    private parser: Parser;
    private threadFunctionCounter: number = 0;

    constructor() {
        this.parser = new Parser();
    }

    public compile(programNode: Program): IRProgram {
        const functions = new Map<string, IRFunction>();

        this.threadFunctionCounter = 0;

        // Discover all functions in the program body
        for (const node of programNode.body) {
            if (
                node.type === 'ThreadFunctionDeclaration' ||
                node.type === 'CustomFunctionDeclaration'
            ) {
                const irFunction = this.parser.compileFunction(node as FunctionDeclaration);

                // Extract function name
                const functionName = this.extractFunctionName(node);
                functions.set(functionName, irFunction);
            }
        }

        return new IRProgram(functions);
    }

    private extractFunctionName(functionNode: ASTNodeBase): string {
        // For ThreadFunctionDeclaration, use start1, start2, start3 naming
        if (functionNode.type === 'ThreadFunctionDeclaration') {
            this.threadFunctionCounter++;
            return `start${this.threadFunctionCounter}`;
        }

        // For CustomFunctionDeclaration, extract the id name
        if (
            functionNode.type === 'CustomFunctionDeclaration' &&
            (functionNode as unknown as { id?: { name?: string } }).id &&
            (functionNode as unknown as { id: { name: string } }).id.name
        ) {
            return (functionNode as unknown as { id: { name: string } }).id.name;
        }
        // Default case, return a generic function name
        return 'function';
    }
}
