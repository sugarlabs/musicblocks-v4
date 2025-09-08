import { FunctionDeclaration, ASTNodeBase, CustomFunctionDeclaration } from '../abstracts';
import { VariableDeclarationStatement } from '../ast/statement/VariableDeclarationStatement';
import { VariableAssignmentStatement } from '../ast/statement/VariableAssignmentStatement';
import { FunctionCallStatement } from '../ast/statement/FunctionCallStatement';
import { ModifyingContextStatement } from '../ast/statement/ModifyingContextStatement';
import { DeclarativeContextStatement } from '../ast/statement/DeclarativeContextStatement';
import { SequenceAlterStatement } from '../ast/statement/SequenceAlterStatement';
import { JumpStatement } from '../ast/statement/JumpStatement';
import { MatchStatement } from '../ast/statement/MatchStatement';
import { Block } from '../ast/Block';
import { BinaryOperatorExpression } from '../ast/expression/BinaryOperatorExpression';
import { UnaryOperatorExpression } from '../ast/expression/UnaryOperatorExpression';
import { FunctionCallExpression } from '../ast/expression/FunctionCallExpression';
import { MemberExpression } from '../ast/expression/MemberExpression';
import { ArrayExpression } from '../ast/expression/ArrayExpression';
import { DictExpression } from '../ast/expression/DictExpression';
import { BranchStatement } from '../ast/statement/BranchStatement';
import { ConditionLoopStatement } from '../ast/statement/ConditionLoopStatement';
import { IterationLoopStatement } from '../ast/statement/IterationLoopStatement';
import { IRFunction } from '../../../runtime/src/interpreter/ir-function';
import { IRBasicBlock } from '../../../runtime/src/interpreter/ir-basic-block';
import { BasicBlockManager } from './basic-block-manager';
import { SymDeclareInstruction } from '../../../runtime/src/interpreter/instructions/sym-declare-instruction';
import { SymAssignInstruction } from '../../../runtime/src/interpreter/instructions/sym-assign-instruction';
import { SymQueryInstruction } from '../../../runtime/src/interpreter/instructions/sym-query-instruction';
import { CompareJumpInstruction } from '../../../runtime/src/interpreter/instructions/compare-jump-instruction';
import { JumpInstruction } from '../../../runtime/src/interpreter/instructions/jump-instruction';
import { CallInstruction } from '../../../runtime/src/interpreter/instructions/call-instruction';
import { SymbolManager } from '../../../runtime/src/execution/scope/symbol-manager';
import { IThreadContext } from '../../../runtime/src/@types/scope';
import { SymbolType, DataType } from '../../../runtime/src/@types/symbol-types';
import {
    IExternalFunctionRegistry,
    MockFunctionRegistry,
} from '../../../runtime/src/execution/external-function-registry';

// Simple compilation context for symbol management during compilation
class CompilationThreadContext implements IThreadContext<Record<string, unknown>> {
    public readonly id = 'compilation-context';
    private locals: Record<string, unknown> = {};
    private globals: Record<string, unknown> = {};

    getLocal<K extends keyof Record<string, unknown>>(
        key: K,
    ): Record<string, unknown>[K] | undefined {
        return this.locals[key];
    }

    setLocal<K extends keyof Record<string, unknown>>(
        key: K,
        value: Record<string, unknown>[K],
    ): void {
        this.locals[key] = value;
    }

    deleteLocal(key: keyof Record<string, unknown>): void {
        delete this.locals[key];
    }

    pushScope(): void {
        // Simple implementation for compilation
    }

    popScope(): void {
        // Simple implementation for compilation
    }

    getGlobal<K extends keyof Record<string, unknown>>(
        key: K,
    ): Record<string, unknown>[K] | undefined {
        return this.globals[key];
    }

    setGlobal<K extends keyof Record<string, unknown>>(
        key: K,
        value: Record<string, unknown>[K],
    ): void {
        this.globals[key] = value;
    }

    deleteGlobal(key: keyof Record<string, unknown>): void {
        delete this.globals[key];
    }
}

interface CompilationContext {
    currentFunction: string;
    currentBlock: IRBasicBlock;
    tempCounter: number;
    symbolManager: SymbolManager<Record<string, unknown>>;
    availableFunctions: Set<string>;
}

export class Parser {
    private blockManager: BasicBlockManager;
    private nodeStack: ASTNodeBase[] = [];
    private context: CompilationContext | null = null;
    private externalFunctions: IExternalFunctionRegistry;
    private programFunctions: Set<string> = new Set();

    constructor(externalFunctions?: IExternalFunctionRegistry) {
        this.blockManager = new BasicBlockManager();
        this.externalFunctions = externalFunctions || new MockFunctionRegistry();
    }

    /**
     * Register all function names from the program before compilation starts.
     * This allows functions to call other functions defined in the same program.
     */
    public registerProgramFunctions(functionNames: string[]): void {
        // Store function names for use during compilation
        this.programFunctions = new Set(functionNames);
    }

    public compileFunction(functionNode: FunctionDeclaration): IRFunction {
        // Create a new BasicBlockManager for each function to avoid shared state
        this.blockManager = new BasicBlockManager();

        const threadContext = new CompilationThreadContext();
        this.context = {
            currentFunction: 'main',
            currentBlock: this.blockManager.createBlock('entry'),
            tempCounter: 0,
            symbolManager: new SymbolManager(threadContext),
            availableFunctions: new Set(),
        };

        if (functionNode.type === 'CustomFunctionDeclaration') {
            const customFunc = functionNode as CustomFunctionDeclaration;
            this.context.symbolManager.declare(
                customFunc.id.name,
                SymbolType.USER_FUNCTION,
                DataType.FUNCTION,
                {},
            );

            // Register this function as available
            this.context.availableFunctions.add(customFunc.id.name);

            for (const param of customFunc.params) {
                this.context.symbolManager.declare(param.name, SymbolType.PARAMETER, DataType.ANY, {
                    isMutable: true,
                });
            }
        }

        this.nodeStack.push(functionNode.body);

        while (this.nodeStack.length > 0) {
            const node = this.nodeStack.pop()!;
            this.parseNode(node);
        }

        const blocks = this.blockManager.getAllBlocks();
        return new IRFunction(this.context.currentFunction, blocks);
    }

    private parseNode(node: ASTNodeBase): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        // Validate AST node before processing
        this.validateASTNode(node);

        switch (node.type) {
            case 'VariableDeclarationStatement':
                this.compileVariableDeclaration(node as VariableDeclarationStatement);
                break;
            case 'VariableAssignmentStatement':
                this.compileVariableAssignment(node as VariableAssignmentStatement);
                break;
            case 'Block':
                this.compileBlock(node as Block);
                break;
            case 'FunctionCallStatement':
                this.compileFunctionCall(node);
                break;
            case 'BranchStatement':
                this.compileBranchStatement(node);
                break;
            case 'ConditionLoopStatement':
                this.compileConditionLoop(node);
                break;
            case 'IterationLoopStatement':
                this.compileIterationLoop(node);
                break;
            case 'ModifyingContextStatement':
                this.compileModifyingContextStatement(node as ModifyingContextStatement);
                break;
            case 'DeclarativeContextStatement':
                this.compileDeclarativeContextStatement(node as DeclarativeContextStatement);
                break;
            case 'SequenceAlterStatement':
                this.compileSequenceAlterStatement(node as SequenceAlterStatement);
                break;
            case 'JumpStatement':
                this.compileJumpStatement(node as JumpStatement);
                break;
            case 'MatchStatement':
                this.compileMatchStatement(node as MatchStatement);
                break;
            default:
                console.warn(`Unknown node type: ${node.type}`);
        }
    }

    private validateASTNode(node: ASTNodeBase): void {
        if (!node) {
            throw new Error('AST node is null or undefined');
        }
        if (!node.type) {
            throw new Error('AST node missing type property');
        }

        switch (node.type) {
            case 'VariableDeclarationStatement': {
                const varDecl = node as VariableDeclarationStatement;
                if (!varDecl.id || !varDecl.id.name) {
                    throw new Error('VariableDeclarationStatement missing valid identifier');
                }
                break;
            }
            case 'VariableAssignmentStatement': {
                const varAssign = node as VariableAssignmentStatement;
                if (!varAssign.id || !varAssign.id.name) {
                    throw new Error('VariableAssignmentStatement missing valid identifier');
                }
                if (!varAssign.init) {
                    throw new Error(
                        'VariableAssignmentStatement missing initialization expression',
                    );
                }
                break;
            }
            case 'FunctionCallStatement': {
                const funcCall = node as FunctionCallStatement;
                if (!funcCall.callee || !funcCall.callee.name) {
                    throw new Error('FunctionCallStatement missing valid callee');
                }
                break;
            }
            case 'Block': {
                const block = node as Block;
                if (!Array.isArray(block.statements)) {
                    throw new Error('Block missing statements array');
                }
                break;
            }
        }
    }

    private compileVariableDeclaration(node: VariableDeclarationStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const variableName = node.id.name;
        const declareInstruction = new SymDeclareInstruction(variableName);
        this.context.currentBlock.instructions.push(declareInstruction);

        if (node.init) {
            this.compileExpression(node.init, variableName);
        }
    }

    private compileVariableAssignment(node: VariableAssignmentStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const variableName = node.id.name;
        this.compileExpression(node.init, variableName);
    }

    private compileExpression(expression: ASTNodeBase, targetVariable: string): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        this.validateExpression(expression);

        switch (expression.type) {
            case 'NumericLiteralExpression':
            case 'StringLiteralExpression':
            case 'BooleanLiteralExpression': {
                const literalValue = (expression as unknown as { value: unknown }).value;
                const assignInstruction = new SymAssignInstruction(targetVariable, literalValue);
                this.context.currentBlock.instructions.push(assignInstruction);
                break;
            }

            case 'IdentifierExpression': {
                const sourceVariable = (expression as unknown as { name: string }).name;
                const tempVar = this.generateTempVar();

                const queryInstruction = new SymQueryInstruction(sourceVariable, tempVar);
                this.context.currentBlock.instructions.push(queryInstruction);

                const assignFromTempInstruction = new SymAssignInstruction(targetVariable, tempVar);
                this.context.currentBlock.instructions.push(assignFromTempInstruction);
                break;
            }

            case 'BinaryOperatorExpression': {
                this.compileBinaryOperation(expression as BinaryOperatorExpression, targetVariable);
                break;
            }

            case 'UnaryOperatorExpression': {
                this.compileUnaryOperation(expression as UnaryOperatorExpression, targetVariable);
                break;
            }

            case 'FunctionCallExpression': {
                this.compileFunctionCallExpression(
                    expression as FunctionCallExpression,
                    targetVariable,
                );
                break;
            }

            case 'MemberExpression': {
                this.compileMemberExpression(expression as MemberExpression, targetVariable);
                break;
            }

            case 'ArrayExpression': {
                this.compileArrayExpression(expression as ArrayExpression, targetVariable);
                break;
            }

            case 'DictExpression': {
                this.compileDictExpression(expression as DictExpression, targetVariable);
                break;
            }

            default:
                console.warn(`Unknown expression type: ${expression.type}`);
        }
    }

    private validateExpression(expression: ASTNodeBase): void {
        if (!expression) {
            throw new Error('Expression is null or undefined');
        }
        if (!expression.type) {
            throw new Error('Expression missing type property');
        }

        switch (expression.type) {
            case 'FunctionCallExpression': {
                const funcCall = expression as FunctionCallExpression;
                if (!funcCall.callee) {
                    throw new Error('FunctionCallExpression missing callee');
                }
                if (!Array.isArray(funcCall.args)) {
                    throw new Error('FunctionCallExpression missing args array');
                }
                break;
            }
            case 'ArrayExpression': {
                const arrayExpr = expression as ArrayExpression;
                if (!Array.isArray(arrayExpr.elements)) {
                    throw new Error('ArrayExpression missing elements array');
                }
                break;
            }
            case 'DictExpression': {
                const dictExpr = expression as DictExpression;
                if (!Array.isArray(dictExpr.entries)) {
                    throw new Error('DictExpression missing entries array');
                }
                break;
            }
        }
    }

    private compileUnaryOperation(
        expression: UnaryOperatorExpression,
        targetVariable: string,
    ): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        let operand: string | number;
        if (expression.operand.type === 'IdentifierExpression') {
            const operandTemp = this.generateTempVar();
            const operandName = (expression.operand as unknown as { name: string }).name;
            const queryOperand = new SymQueryInstruction(operandName, operandTemp);
            this.context.currentBlock.instructions.push(queryOperand);
            operand = operandTemp;
        } else if (expression.operand.type === 'NumericLiteralExpression') {
            operand = (expression.operand as unknown as { value: number }).value;
        } else {
            const operandTemp = this.generateTempVar();
            this.compileExpression(expression.operand, operandTemp);
            operand = operandTemp;
        }

        const operation = {
            op: expression.operator,
            operand: operand,
        };

        const assignInstruction = new SymAssignInstruction(targetVariable, operation);
        this.context.currentBlock.instructions.push(assignInstruction);
    }

    private compileFunctionCallExpression(
        expression: FunctionCallExpression,
        targetVariable: string,
    ): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const functionName = (expression.callee as unknown as { name: string }).name;

        const compiledArgs: unknown[] = [];
        for (const arg of expression.args) {
            const tempVar = this.generateTempVar();
            this.compileExpression(arg.value, tempVar);
            compiledArgs.push(tempVar);
        }

        // Validate function exists at compile time
        if (!this.isKnownFunction(functionName)) {
            throw new Error(`Unknown function: ${functionName}`);
        }

        const callInstruction = new CallInstruction(functionName, compiledArgs);
        this.context.currentBlock.instructions.push(callInstruction);

        const resultTemp = this.generateTempVar();
        const assignResult = new SymAssignInstruction(targetVariable, resultTemp);
        this.context.currentBlock.instructions.push(assignResult);
    }

    private compileMemberExpression(expression: MemberExpression, targetVariable: string): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const objectTemp = this.generateTempVar();
        const propertyTemp = this.generateTempVar();

        this.compileExpression(expression.object, objectTemp);
        this.compileExpression(expression.property, propertyTemp);

        const memberAccess = {
            op: 'member_access',
            object: objectTemp,
            property: propertyTemp,
        };

        const assignInstruction = new SymAssignInstruction(targetVariable, memberAccess);
        this.context.currentBlock.instructions.push(assignInstruction);
    }

    private compileArrayExpression(expression: ArrayExpression, targetVariable: string): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const compiledElements: string[] = [];
        for (const element of expression.elements) {
            const elementTemp = this.generateTempVar();
            this.compileExpression(element, elementTemp);
            compiledElements.push(elementTemp);
        }

        const arrayConstruction = {
            op: 'array_construction',
            elements: compiledElements,
        };

        const assignInstruction = new SymAssignInstruction(targetVariable, arrayConstruction);
        this.context.currentBlock.instructions.push(assignInstruction);
    }

    private compileDictExpression(expression: DictExpression, targetVariable: string): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const compiledEntries: { key: string; value: string }[] = [];
        for (const entry of expression.entries) {
            const keyTemp = this.generateTempVar();
            const valueTemp = this.generateTempVar();

            this.compileExpression(entry.key, keyTemp);
            this.compileExpression(entry.value, valueTemp);

            compiledEntries.push({ key: keyTemp, value: valueTemp });
        }

        const dictConstruction = {
            op: 'dict_construction',
            entries: compiledEntries,
        };

        const assignInstruction = new SymAssignInstruction(targetVariable, dictConstruction);
        this.context.currentBlock.instructions.push(assignInstruction);
    }

    private compileBinaryOperation(
        expression: BinaryOperatorExpression,
        targetVariable: string,
    ): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        let leftOperand: string | number;
        if (expression.left.type === 'IdentifierExpression') {
            const leftTemp = this.generateTempVar();
            const leftName = (expression.left as unknown as { name: string }).name;
            const queryLeft = new SymQueryInstruction(leftName, leftTemp);
            this.context.currentBlock.instructions.push(queryLeft);
            leftOperand = leftTemp;
        } else if (expression.left.type === 'NumericLiteralExpression') {
            leftOperand = (expression.left as unknown as { value: number }).value;
        } else {
            leftOperand = 0;
        }

        let rightOperand: string | number;
        if (expression.right.type === 'IdentifierExpression') {
            const rightTemp = this.generateTempVar();
            const rightName = (expression.right as unknown as { name: string }).name;
            const queryRight = new SymQueryInstruction(rightName, rightTemp);
            this.context.currentBlock.instructions.push(queryRight);
            rightOperand = rightTemp;
        } else if (expression.right.type === 'NumericLiteralExpression') {
            rightOperand = (expression.right as unknown as { value: number }).value;
        } else {
            rightOperand = 0;
        }

        const operation = {
            op: expression.operator,
            left: leftOperand,
            right: rightOperand,
        };

        const assignInstruction = new SymAssignInstruction(targetVariable, operation);
        this.context.currentBlock.instructions.push(assignInstruction);
    }

    private compileBlock(node: Block): void {
        for (let i = node.statements.length - 1; i >= 0; i--) {
            this.nodeStack.push(node.statements[i]);
        }
    }

    private compileFunctionCall(node: ASTNodeBase): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const functionCallNode = node as FunctionCallStatement;
        const functionName = functionCallNode.callee.name;

        const compiledArgs: unknown[] = [];

        for (const arg of functionCallNode.args) {
            if (arg.value.type === 'NumericLiteralExpression') {
                const literalValue = (arg.value as unknown as { value: number }).value;
                compiledArgs.push(literalValue);
            } else if (arg.value.type === 'StringLiteralExpression') {
                const stringValue = (arg.value as unknown as { value: string }).value;
                compiledArgs.push(stringValue);
            } else if (arg.value.type === 'IdentifierExpression') {
                const variableName = (arg.value as unknown as { name: string }).name;

                // Check if this identifier refers to a known function
                if (this.isKnownFunction(variableName)) {
                    // Pass function name directly as a function reference
                    compiledArgs.push(`__func_ref:${variableName}`);
                } else {
                    // Treat as variable lookup
                    const tempVar = this.generateTempVar();
                    const queryInstruction = new SymQueryInstruction(variableName, tempVar);
                    this.context.currentBlock.instructions.push(queryInstruction);
                    compiledArgs.push(tempVar);
                }
            } else if (arg.value.type === 'BinaryOperatorExpression') {
                const tempVar = this.generateTempVar();
                this.compileExpression(arg.value, tempVar);
                compiledArgs.push(tempVar);
            } else {
                compiledArgs.push(null);
            }
        }

        // Validate function exists at compile time
        if (!this.isKnownFunction(functionName)) {
            throw new Error(`Unknown function: ${functionName}`);
        }

        // Generate the call instruction
        const callInstruction = new CallInstruction(functionName, compiledArgs);
        this.context.currentBlock.instructions.push(callInstruction);
    }

    private isKnownFunction(functionName: string): boolean {
        if (!this.context) {
            return false;
        }
        // Check if it's a user-defined function or external function
        return (
            this.context.availableFunctions.has(functionName) ||
            this.programFunctions.has(functionName) ||
            this.externalFunctions.hasFunction(functionName)
        );
    }

    private compileBranchStatement(node: ASTNodeBase): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const branchNode = node as BranchStatement;

        const ifTrueBlock = this.blockManager.createBlock('if_true');
        const endIfBlock = this.blockManager.createBlock('end_if');
        let ifFalseBlock: IRBasicBlock | null = null;

        for (let i = 0; i < branchNode.clauses.length; i++) {
            const clause = branchNode.clauses[i];

            if (i === branchNode.clauses.length - 1) {
                ifFalseBlock = endIfBlock;
            } else {
                ifFalseBlock = this.blockManager.createBlock('if_next');
            }
            if (clause.test.type === 'BinaryOperatorExpression') {
                this.compileBinaryComparison(
                    clause.test as BinaryOperatorExpression,
                    ifTrueBlock.label,
                    ifFalseBlock.label,
                );
            } else if (clause.test.type === 'BooleanLiteralExpression') {
                const boolValue = (clause.test as unknown as { value: boolean }).value;
                if (boolValue) {
                    const jumpInstruction = new JumpInstruction(ifTrueBlock.label);
                    this.context.currentBlock.instructions.push(jumpInstruction);
                } else {
                    const jumpInstruction = new JumpInstruction(ifFalseBlock.label);
                    this.context.currentBlock.instructions.push(jumpInstruction);
                }
            }

            this.context.currentBlock = ifTrueBlock;
            this.nodeStack.push(clause.body);

            const jumpToEnd = new JumpInstruction(endIfBlock.label);
            ifTrueBlock.instructions.push(jumpToEnd);

            if (ifFalseBlock !== endIfBlock) {
                this.context.currentBlock = ifFalseBlock;
            }
        }
        this.context.currentBlock = endIfBlock;
    }

    private compileBinaryComparison(
        expression: BinaryOperatorExpression,
        trueTarget: string,
        falseTarget: string,
    ): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        let leftOperand: string | number;
        if (expression.left.type === 'IdentifierExpression') {
            const leftTemp = this.generateTempVar();
            const leftName = (expression.left as unknown as { name: string }).name;
            const queryLeft = new SymQueryInstruction(leftName, leftTemp);
            this.context.currentBlock.instructions.push(queryLeft);
            leftOperand = leftTemp;
        } else if (expression.left.type === 'NumericLiteralExpression') {
            leftOperand = (expression.left as unknown as { value: number }).value;
        } else {
            leftOperand = 0;
        }

        let rightOperand: string | number;
        if (expression.right.type === 'IdentifierExpression') {
            const rightTemp = this.generateTempVar();
            const rightName = (expression.right as unknown as { name: string }).name;
            const queryRight = new SymQueryInstruction(rightName, rightTemp);
            this.context.currentBlock.instructions.push(queryRight);
            rightOperand = rightTemp;
        } else if (expression.right.type === 'NumericLiteralExpression') {
            rightOperand = (expression.right as unknown as { value: number }).value;
        } else {
            rightOperand = 0;
        }

        const compareJumpInstruction = new CompareJumpInstruction(
            expression.operator,
            leftOperand,
            rightOperand,
            trueTarget,
            falseTarget,
        );
        this.context.currentBlock.instructions.push(compareJumpInstruction);
    }

    private compileConditionLoop(node: ASTNodeBase): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const loopNode = node as ConditionLoopStatement;

        const loopConditionBlock = this.blockManager.createBlock('loop_condition');
        const loopBodyBlock = this.blockManager.createBlock('loop_body');
        const loopEndBlock = this.blockManager.createBlock('loop_end');

        const jumpToCondition = new JumpInstruction(loopConditionBlock.label);
        this.context.currentBlock.instructions.push(jumpToCondition);

        this.context.currentBlock = loopConditionBlock;

        if (loopNode.test.type === 'BinaryOperatorExpression') {
            this.compileBinaryComparison(
                loopNode.test as BinaryOperatorExpression,
                loopBodyBlock.label,
                loopEndBlock.label,
            );
        } else if (loopNode.test.type === 'BooleanLiteralExpression') {
            const boolValue = (loopNode.test as unknown as { value: boolean }).value;
            if (boolValue) {
                const jumpToBody = new JumpInstruction(loopBodyBlock.label);
                this.context.currentBlock.instructions.push(jumpToBody);
            } else {
                const jumpToEnd = new JumpInstruction(loopEndBlock.label);
                this.context.currentBlock.instructions.push(jumpToEnd);
            }
        }

        this.context.currentBlock = loopBodyBlock;
        this.nodeStack.push(loopNode.body);

        const jumpBackToCondition = new JumpInstruction(loopConditionBlock.label);
        loopBodyBlock.instructions.push(jumpBackToCondition);

        this.context.currentBlock = loopEndBlock;
    }

    private compileIterationLoop(node: ASTNodeBase): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        const loopNode = node as IterationLoopStatement;

        // For iteration loops, we need to:
        // 1. Initialize the iterator variable (typically to 0)
        // 2. Check if iterator < limit
        // 3. Execute body
        // 4. Increment iterator
        // 5. Jump back to condition
        const loopInitBlock = this.blockManager.createBlock('loop_init');
        const loopConditionBlock = this.blockManager.createBlock('loop_condition');
        const loopBodyBlock = this.blockManager.createBlock('loop_body');
        const loopIncrementBlock = this.blockManager.createBlock('loop_increment');
        const loopEndBlock = this.blockManager.createBlock('loop_end');

        const jumpToInit = new JumpInstruction(loopInitBlock.label);
        this.context.currentBlock.instructions.push(jumpToInit);

        this.context.currentBlock = loopInitBlock;
        const iteratorName = loopNode.value.name;
        const declareIterator = new SymDeclareInstruction(iteratorName);
        const initIterator = new SymAssignInstruction(iteratorName, 0);
        this.context.currentBlock.instructions.push(declareIterator);
        this.context.currentBlock.instructions.push(initIterator);

        const jumpToCondition = new JumpInstruction(loopConditionBlock.label);
        this.context.currentBlock.instructions.push(jumpToCondition);

        this.context.currentBlock = loopConditionBlock;
        const iteratorTemp = this.generateTempVar();
        const queryIterator = new SymQueryInstruction(iteratorName, iteratorTemp);
        this.context.currentBlock.instructions.push(queryIterator);

        let limitOperand: string | number;
        if (loopNode.iterator.type === 'NumericLiteralExpression') {
            limitOperand = (loopNode.iterator as unknown as { value: number }).value;
        } else if (loopNode.iterator.type === 'IdentifierExpression') {
            const limitTemp = this.generateTempVar();
            const limitName = (loopNode.iterator as unknown as { name: string }).name;
            const queryLimit = new SymQueryInstruction(limitName, limitTemp);
            this.context.currentBlock.instructions.push(queryLimit);
            limitOperand = limitTemp;
        } else {
            limitOperand = 1;
        }

        const conditionCheck = new CompareJumpInstruction(
            'lessThan',
            iteratorTemp,
            limitOperand,
            loopBodyBlock.label,
            loopEndBlock.label,
        );
        this.context.currentBlock.instructions.push(conditionCheck);

        this.context.currentBlock = loopBodyBlock;
        this.nodeStack.push(loopNode.body);

        const jumpToIncrement = new JumpInstruction(loopIncrementBlock.label);
        this.context.currentBlock.instructions.push(jumpToIncrement);

        this.context.currentBlock = loopIncrementBlock;

        const incrementIteratorTemp = this.generateTempVar();
        const queryIteratorForIncrement = new SymQueryInstruction(
            iteratorName,
            incrementIteratorTemp,
        );
        this.context.currentBlock.instructions.push(queryIteratorForIncrement);

        const incrementOp = {
            op: 'add',
            left: incrementIteratorTemp,
            right: 1,
        };
        const incrementIterator = new SymAssignInstruction(iteratorName, incrementOp);
        this.context.currentBlock.instructions.push(incrementIterator);

        const jumpBackToCondition = new JumpInstruction(loopConditionBlock.label);
        this.context.currentBlock.instructions.push(jumpBackToCondition);

        this.context.currentBlock = loopEndBlock;
    }

    private generateTempVar(): string {
        if (!this.context) {
            throw new Error('No compilation context available');
        }
        return `%${this.context.tempCounter++}`;
    }

    private compileModifyingContextStatement(node: ModifyingContextStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        /*
         * ModifyingContextStatement should:
         * 1. Create Basic Block1 - Set context with args
         * 2. Jump to Entry point of Basic Block for body
         * 3. Generate Basic Blocks for body
         * 4. Jump to Basic Block3 - Reset context
         * 5. Create Basic Block3 - Reset context and continue
         */
        const contextSetupBlock = this.blockManager.createBlock('context_setup');
        const bodyEntryBlock = this.blockManager.createBlock('context_body');
        const contextResetBlock = this.blockManager.createBlock('context_reset');

        const jumpToSetup = new JumpInstruction(contextSetupBlock.label);
        this.context.currentBlock.instructions.push(jumpToSetup);

        this.context.currentBlock = contextSetupBlock;

        for (const arg of node.args) {
            const paramName = (arg.param as unknown as { name: string }).name;
            const tempVar = this.generateTempVar();

            this.compileExpression(arg.value, tempVar);
            const contextCall = new CallInstruction(`setContext_${paramName}`, [tempVar]);
            this.context.currentBlock.instructions.push(contextCall);
        }

        const jumpToBody = new JumpInstruction(bodyEntryBlock.label);
        this.context.currentBlock.instructions.push(jumpToBody);

        this.context.currentBlock = bodyEntryBlock;
        this.nodeStack.push(node.body);

        const jumpToReset = new JumpInstruction(contextResetBlock.label);
        this.context.currentBlock.instructions.push(jumpToReset);

        this.context.currentBlock = contextResetBlock;

        for (const arg of node.args) {
            const paramName = (arg.param as unknown as { name: string }).name;

            const resetCall = new CallInstruction(`resetContext_${paramName}`, []);
            this.context.currentBlock.instructions.push(resetCall);
        }
    }

    private compileDeclarativeContextStatement(node: DeclarativeContextStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        /*
         * DeclarativeContextStatement Processing:
         * 1. Collect declarations for all body statements
         * 2. Collect arguments from Statement.Args array
         * 3. Find appropriate logic for declarative context establishment
         * 4. Pass declarations and evaluated arguments to context establishment logic
         * 5. Call appropriate logic for context declaration
         */
        for (const arg of node.args) {
            const paramName = (arg.param as unknown as { name: string }).name;
            const tempVar = this.generateTempVar();

            this.compileExpression(arg.value, tempVar);

            const declarativeCall = new CallInstruction(`declareContext_${paramName}`, [tempVar]);
            this.context.currentBlock.instructions.push(declarativeCall);
        }

        this.nodeStack.push(node.body);
    }

    private compileSequenceAlterStatement(node: SequenceAlterStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        /*
         * SequenceAlterStatement Processing:
         * 1. Find the statements from Statement.Body
         * 2. Collect the arguments from Statement.Args array
         * 3. Find the appropriate logic for the sequence alteration
         * 4. Pass the evaluated arguments to sequence alteration logic
         * 5. Run the appropriate logic for statement sequence modification
         * 6. Return the list of modified statements for execution
         */
        for (const arg of node.args) {
            const paramName = (arg.param as unknown as { name: string }).name;
            const tempVar = this.generateTempVar();

            this.compileExpression(arg.value, tempVar);

            const alterCall = new CallInstruction(`alterSequence_${paramName}`, [tempVar]);
            this.context.currentBlock.instructions.push(alterCall);
        }

        this.nodeStack.push(node.body);
    }

    private compileJumpStatement(node: JumpStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        /*
         * JumpStatement Processing:
         * Write appropriate logic based on the variant type (Break, Continue, Return)
         */

        switch (node.variant) {
            case 'break': {
                const breakCall = new CallInstruction('break', []);
                this.context.currentBlock.instructions.push(breakCall);
                break;
            }
            case 'continue': {
                const continueCall = new CallInstruction('continue', []);
                this.context.currentBlock.instructions.push(continueCall);
                break;
            }
            case 'return': {
                const returnCall = new CallInstruction('return', []);
                this.context.currentBlock.instructions.push(returnCall);
                break;
            }
            default:
                throw new Error(`Unknown jump variant: ${node.variant}`);
        }
    }

    private compileMatchStatement(node: MatchStatement): void {
        if (!this.context) {
            throw new Error('No compilation context available');
        }

        /*
         * MatchStatement Processing:
         * 1. Generate Basic Blocks for each case body
         * 2. Create Entry Point Basic Block for discriminant evaluation
         * 3. Create Exit Point Basic Block for match completion
         * 4. For each case: Create comparison between discriminant and case match
         * 5. Jump to appropriate case body or next case
         */
        const matchEntryBlock = this.blockManager.createBlock('match_entry');
        const matchExitBlock = this.blockManager.createBlock('match_exit');

        const jumpToEntry = new JumpInstruction(matchEntryBlock.label);
        this.context.currentBlock.instructions.push(jumpToEntry);

        this.context.currentBlock = matchEntryBlock;
        const discriminantTemp = this.generateTempVar();
        this.compileExpression(node.discriminant, discriminantTemp);

        for (let i = 0; i < node.cases.length; i++) {
            const caseItem = node.cases[i];
            const caseBodyBlock = this.blockManager.createBlock(`match_case_${i}`);
            const nextCaseBlock =
                i < node.cases.length - 1
                    ? this.blockManager.createBlock(`match_case_${i + 1}_check`)
                    : matchExitBlock;

            const caseValue = (caseItem.match as unknown as { value: unknown }).value;
            const compareJump = new CompareJumpInstruction(
                'equal',
                discriminantTemp,
                caseValue,
                caseBodyBlock.label,
                nextCaseBlock.label,
            );
            this.context.currentBlock.instructions.push(compareJump);

            this.context.currentBlock = caseBodyBlock;
            this.nodeStack.push(caseItem.body);

            const jumpToExit = new JumpInstruction(matchExitBlock.label);
            this.context.currentBlock.instructions.push(jumpToExit);

            if (i < node.cases.length - 1) {
                this.context.currentBlock = nextCaseBlock;
            }
        }

        this.context.currentBlock = matchExitBlock;
    }
}
