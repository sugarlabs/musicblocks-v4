import { Program, FunctionDeclaration, ASTNodeBase } from '../abstracts';
import { IRProgram } from '../../../runtime/src/interpreter/ir-program';
import { IRFunction } from '../../../runtime/src/interpreter/ir-function';
import { IExternalFunctionRegistry } from '../../../runtime/src/execution/external-function-registry';
import { Parser } from './parser';

export class Compiler {
    private parser: Parser;
    private threadFunctionCounter: number = 0;

    constructor(externalFunctions?: IExternalFunctionRegistry) {
        this.parser = new Parser(externalFunctions);
    }

    public compile(programNode: Program): IRProgram {
        const functions = new Map<string, IRFunction>();

        this.threadFunctionCounter = 0;

        const functionDeclarations: { node: FunctionDeclaration; name: string }[] = [];
        for (const node of programNode.body) {
            if (
                node.type === 'ThreadFunctionDeclaration' ||
                node.type === 'CustomFunctionDeclaration'
            ) {
                const functionName = this.extractFunctionName(node);
                functionDeclarations.push({
                    node: node as FunctionDeclaration,
                    name: functionName,
                });
            }
        }

        this.parser.registerProgramFunctions(functionDeclarations.map((f) => f.name));

        for (const { node, name } of functionDeclarations) {
            const irFunction = this.parser.compileFunction(node);
            functions.set(name, irFunction);
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
        return 'function';
    }
}
