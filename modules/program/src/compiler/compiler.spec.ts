import { Compiler } from './compiler';
import { ProgramDeclaration } from '../ast/ProgramDeclaration';
import { ThreadFunctionDeclaration } from '../ast/function/ThreadFunctionDeclaration';
import { CustomFunctionDeclaration } from '../ast/function/CustomFunctionDeclaration';
import { Block } from '../ast/Block';
import { VariableDeclarationStatement } from '../ast/statement/VariableDeclarationStatement';
import { VariableAssignmentStatement } from '../ast/statement/VariableAssignmentStatement';
import { FunctionCallStatement } from '../ast/statement/FunctionCallStatement';
import { BranchStatement } from '../ast/statement/BranchStatement';
import { IterationLoopStatement } from '../ast/statement/IterationLoopStatement';
import { ModifyingContextStatement } from '../ast/statement/ModifyingContextStatement';
import { IdentifierExpression } from '../ast/expression/IdentifierExpression';
import { NumericLiteralExpression } from '../ast/expression/NumericLiteralExpression';
import { StringLiteralExpression } from '../ast/expression/StringLiteralExpression';
import { BooleanLiteralExpression } from '../ast/expression/BooleanLiteralExpression';
import { BinaryOperatorExpression } from '../ast/expression/BinaryOperatorExpression';
import { ArrayExpression } from '../ast/expression/ArrayExpression';
import { createMusicBlocksProgram } from '../examples/MusicBlocksProgram';
import { createMusicBlocksProgram2 } from '../examples/MusicBlocksProgram2';

describe('Compiler', () => {
    let compiler: Compiler;

    beforeEach(() => {
        compiler = new Compiler();
    });

    it('should be defined', () => {
        expect(compiler).toBeDefined();
    });

    it('should compile simple variable declaration and assignment', () => {
        // Create a simple AST: let x = 5;
        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('x'),
            new NumericLiteralExpression(5),
        );

        const block = new Block([variableDecl]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        // Compile the program
        const irProgram = compiler.compile(program);

        // Verify that the IR program was generated
        expect(irProgram).toBeDefined();
        expect(irProgram.functions).toBeDefined();
        expect(irProgram.functions.size).toBeGreaterThan(0);
    });

    it('should compile variable assignment from another variable', () => {
        // Create AST: let x = 5; let y = x;
        const variableDecl1 = new VariableDeclarationStatement(
            new IdentifierExpression('x'),
            new NumericLiteralExpression(5),
        );

        const variableDecl2 = new VariableDeclarationStatement(
            new IdentifierExpression('y'),
            new IdentifierExpression('x'),
        );

        const block = new Block([variableDecl1, variableDecl2]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        // Compile the program
        const irProgram = compiler.compile(program);

        // Verify that the IR program was generated
        expect(irProgram).toBeDefined();
        expect(irProgram.functions).toBeDefined();
    });

    it('should generate correct IR instructions for variable declaration', () => {
        // Create a simple AST: let x = 5;
        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('x'),
            new NumericLiteralExpression(5),
        );

        const block = new Block([variableDecl]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        // Compile the program
        const irProgram = compiler.compile(program);

        // Get the first start function (ThreadFunctionDeclaration creates start1, start2, etc.)
        const startFunction = irProgram.functions.get('start1');
        expect(startFunction).toBeDefined();

        if (startFunction) {
            // Check that we have at least one basic block
            expect(startFunction.blocks).toBeDefined();
            expect(startFunction.blocks.length).toBeGreaterThan(0);

            // Check that the first block has instructions
            const firstBlock = startFunction.blocks[0];
            expect(firstBlock.instructions).toBeDefined();
            expect(firstBlock.instructions.length).toBeGreaterThan(0);

            // Verify we have a declare instruction followed by an assign instruction
            const instructions = firstBlock.instructions;
            expect(instructions[0].constructor.name).toBe('SymDeclareInstruction');
            expect(instructions[1].constructor.name).toBe('SymAssignInstruction');
        }
    });

    it('should compile function calls with arguments', () => {
        // Create AST: let x = 5; action1();
        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('x'),
            new NumericLiteralExpression(5),
        );

        const functionCall = new FunctionCallStatement(new IdentifierExpression('action1'), []);

        const block = new Block([variableDecl, functionCall]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        // Compile the program
        const irProgram = compiler.compile(program);

        // Get the first start function (ThreadFunctionDeclaration creates start1, start2, etc.)
        const startFunction = irProgram.functions.get('start1');
        expect(startFunction).toBeDefined();

        if (startFunction) {
            const firstBlock = startFunction.blocks[0];
            const instructions = firstBlock.instructions;

            // Should have at least 3 instructions:
            // 1. declare x
            // 2. assign x = 5
            // 3. call action1
            expect(instructions.length).toBeGreaterThanOrEqual(3);

            // The last instruction should be a CallInstruction
            const lastInstruction = instructions[instructions.length - 1];
            expect(lastInstruction.constructor.name).toBe('CallInstruction');
        }
    });

    it('should compile complex expressions with binary operators', () => {
        // Create AST: let result = 10 + 20;
        const binaryExpr = new BinaryOperatorExpression(
            'add',
            new NumericLiteralExpression(10),
            new NumericLiteralExpression(20),
        );

        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('result'),
            binaryExpr,
        );

        const block = new Block([variableDecl]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);

        const startFunction = irProgram.functions.get('start1');
        expect(startFunction).toBeDefined();

        if (startFunction) {
            expect(startFunction.blocks[0].instructions.length).toBeGreaterThanOrEqual(2);
            const instructions = startFunction.blocks[0].instructions;
            expect(instructions[0].constructor.name).toBe('SymDeclareInstruction');
            expect(instructions[1].constructor.name).toBe('SymAssignInstruction');
        }
    });

    it('should compile multiple thread functions with different names', () => {
        const block1 = new Block([
            new VariableDeclarationStatement(
                new IdentifierExpression('x'),
                new NumericLiteralExpression(1),
            ),
        ]);

        const block2 = new Block([
            new VariableDeclarationStatement(
                new IdentifierExpression('y'),
                new NumericLiteralExpression(2),
            ),
        ]);

        const threadFunction1 = new ThreadFunctionDeclaration(block1);
        const threadFunction2 = new ThreadFunctionDeclaration(block2);
        const program = new ProgramDeclaration([threadFunction1, threadFunction2]);

        const irProgram = compiler.compile(program);

        expect(irProgram.functions.size).toBe(2);
        expect(irProgram.functions.has('start1')).toBe(true);
        expect(irProgram.functions.has('start2')).toBe(true);
    });

    it('should compile custom functions with proper names', () => {
        const customFunction = new CustomFunctionDeclaration(
            new IdentifierExpression('myCustomFunction'),
            [],
            new Block([new FunctionCallStatement(new IdentifierExpression('doSomething'), [])]),
        );

        const program = new ProgramDeclaration([customFunction]);
        const irProgram = compiler.compile(program);

        expect(irProgram.functions.size).toBe(1);
        expect(irProgram.functions.has('myCustomFunction')).toBe(true);
    });

    it('should compile iteration loops with proper control flow', () => {
        const loopBody = new Block([
            new FunctionCallStatement(new IdentifierExpression('doWork'), []),
        ]);

        const loop = new IterationLoopStatement(
            new IdentifierExpression('i'),
            new NumericLiteralExpression(5),
            loopBody,
        );

        const block = new Block([loop]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            // Should have multiple blocks for loop control flow
            expect(startFunction.blocks.length).toBeGreaterThan(1);
        }
    });

    it('should compile branch statements with conditional logic', () => {
        const branch = new BranchStatement([
            {
                test: new BooleanLiteralExpression(true),
                body: new Block([
                    new FunctionCallStatement(new IdentifierExpression('trueAction'), []),
                ]),
            },
            {
                test: new BooleanLiteralExpression(false),
                body: new Block([
                    new FunctionCallStatement(new IdentifierExpression('falseAction'), []),
                ]),
            },
        ]);

        const block = new Block([branch]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            // Should have multiple blocks for branch control flow
            expect(startFunction.blocks.length).toBeGreaterThan(1);
        }
    });

    it('should compile modifying context statements', () => {
        const contextBody = new Block([
            new FunctionCallStatement(new IdentifierExpression('playNote'), []),
        ]);

        const context = new ModifyingContextStatement(
            [
                {
                    param: new IdentifierExpression('instrument'),
                    value: new StringLiteralExpression('guitar'),
                },
            ],
            contextBody,
        );

        const block = new Block([context]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            // Should have multiple blocks for context setup/teardown
            expect(startFunction.blocks.length).toBeGreaterThan(1);
        }
    });

    it('should compile array expressions', () => {
        const arrayExpr = new ArrayExpression([
            new NumericLiteralExpression(1),
            new NumericLiteralExpression(2),
            new NumericLiteralExpression(3),
        ]);

        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('myArray'),
            arrayExpr,
        );

        const block = new Block([variableDecl]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            expect(startFunction.blocks[0].instructions.length).toBeGreaterThanOrEqual(2);
        }
    });

    it('should compile variable assignments correctly', () => {
        const variableDecl = new VariableDeclarationStatement(
            new IdentifierExpression('x'),
            new NumericLiteralExpression(10),
        );

        const variableAssign = new VariableAssignmentStatement(
            ['='],
            new IdentifierExpression('x'),
            new NumericLiteralExpression(20),
        );

        const block = new Block([variableDecl, variableAssign]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            const instructions = startFunction.blocks[0].instructions;
            expect(instructions.length).toBeGreaterThanOrEqual(3);
            expect(instructions[0].constructor.name).toBe('SymDeclareInstruction');
            expect(instructions[1].constructor.name).toBe('SymAssignInstruction');
            expect(instructions[2].constructor.name).toBe('SymAssignInstruction');
        }
    });

    it('should handle function calls with parameters', () => {
        const functionCall = new FunctionCallStatement(new IdentifierExpression('testFunc'), [
            {
                param: new IdentifierExpression('param1'),
                value: new NumericLiteralExpression(42),
            },
            {
                param: new IdentifierExpression('param2'),
                value: new StringLiteralExpression('hello'),
            },
        ]);

        const block = new Block([functionCall]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            const instructions = startFunction.blocks[0].instructions;
            expect(instructions.some((inst) => inst.constructor.name === 'CallInstruction')).toBe(
                true,
            );
        }
    });

    it('should compile the complete MusicBlocksProgram example', () => {
        const program = createMusicBlocksProgram();
        const irProgram = compiler.compile(program);

        // Should have 5 functions: start1, start2, action1, action2, action3
        expect(irProgram.functions.size).toBe(5);

        const expectedFunctions = ['start1', 'start2', 'action1', 'action2', 'action3'];
        for (const funcName of expectedFunctions) {
            expect(irProgram.functions.has(funcName)).toBe(true);
            const func = irProgram.functions.get(funcName);
            expect(func).toBeDefined();
            if (func) {
                expect(func.blocks.length).toBeGreaterThan(0);
                for (const block of func.blocks) {
                    expect(block.label).toBeDefined();
                    expect(block.instructions).toBeDefined();
                }
            }
        }
    });

    it('should compile the complete MusicBlocksProgram2 example', () => {
        const program = createMusicBlocksProgram2();
        const irProgram = compiler.compile(program);

        // Should have 5 functions: start1, start2, action, action1, action2
        expect(irProgram.functions.size).toBe(5);

        const expectedFunctions = ['start1', 'start2', 'action', 'action1', 'action2'];
        for (const funcName of expectedFunctions) {
            expect(irProgram.functions.has(funcName)).toBe(true);
            const func = irProgram.functions.get(funcName);
            expect(func).toBeDefined();
            if (func) {
                expect(func.blocks.length).toBeGreaterThan(0);
                for (const block of func.blocks) {
                    expect(block.label).toBeDefined();
                    expect(block.instructions).toBeDefined();
                }
            }
        }
        const action2Function = irProgram.functions.get('action2');
        expect(action2Function).toBeDefined();
        if (action2Function) {
            expect(action2Function.blocks.length).toBeGreaterThan(3);
        }
    });

    it('should generate detailed IR output for MusicBlocksProgram2', () => {
        const program = createMusicBlocksProgram2();
        const irProgram = compiler.compile(program);

        let totalInstructions = 0;
        let totalBlocks = 0;

        for (const [funcName, func] of irProgram.functions) {
            totalBlocks += func.blocks.length;
            for (const block of func.blocks) {
                totalInstructions += block.instructions.length;
            }

            if (funcName === 'action2') {
                // action2 has nested modifying contexts, should be complex
                expect(func.blocks.length).toBeGreaterThan(5);
            }
            if (funcName === 'action1') {
                // action1 has branch statement, should have multiple blocks
                expect(func.blocks.length).toBeGreaterThan(3);
            }
        }

        expect(totalBlocks).toBeGreaterThan(10); // Should have many blocks
        expect(totalInstructions).toBeGreaterThan(20); // Should have many instructions
    });

    it('should handle nested control structures correctly', () => {
        // Create nested loops and branches
        const innerLoop = new IterationLoopStatement(
            new IdentifierExpression('j'),
            new NumericLiteralExpression(3),
            new Block([new FunctionCallStatement(new IdentifierExpression('innerWork'), [])]),
        );

        const outerLoop = new IterationLoopStatement(
            new IdentifierExpression('i'),
            new NumericLiteralExpression(2),
            new Block([
                new FunctionCallStatement(new IdentifierExpression('outerWork'), []),
                innerLoop,
            ]),
        );

        const block = new Block([outerLoop]);
        const threadFunction = new ThreadFunctionDeclaration(block);
        const program = new ProgramDeclaration([threadFunction]);

        const irProgram = compiler.compile(program);
        const startFunction = irProgram.functions.get('start1');

        expect(startFunction).toBeDefined();
        if (startFunction) {
            expect(startFunction.blocks.length).toBeGreaterThan(5);

            let totalInstructions = 0;
            for (const block of startFunction.blocks) {
                totalInstructions += block.instructions.length;
            }
            expect(totalInstructions).toBeGreaterThan(10);
        }
    });

    it('should preserve program structure integrity', () => {
        const program = createMusicBlocksProgram2();
        const irProgram = compiler.compile(program);

        expect(irProgram).toBeDefined();
        expect(irProgram.functions).toBeInstanceOf(Map);

        for (const [name, func] of irProgram.functions) {
            expect(typeof name).toBe('string');
            expect(func).toBeDefined();
            expect(Array.isArray(func.blocks)).toBe(true);

            for (const block of func.blocks) {
                expect(typeof block.label).toBe('string');
                expect(Array.isArray(block.instructions)).toBe(true);

                for (const instruction of block.instructions) {
                    expect(instruction).toBeDefined();
                    expect(typeof instruction.constructor.name).toBe('string');
                }
            }
        }
    });

    it('should handle empty programs gracefully', () => {
        const emptyProgram = new ProgramDeclaration([]);
        const irProgram = compiler.compile(emptyProgram);

        expect(irProgram).toBeDefined();
        expect(irProgram.functions.size).toBe(0);
    });

    it('should generate instruction type statistics correctly', () => {
        const program = createMusicBlocksProgram();
        const irProgram = compiler.compile(program);

        const instructionCounts = new Map<string, number>();

        for (const func of irProgram.functions.values()) {
            for (const block of func.blocks) {
                for (const instruction of block.instructions) {
                    const type = instruction.constructor.name;
                    instructionCounts.set(type, (instructionCounts.get(type) || 0) + 1);
                }
            }
        }

        // Should have various instruction types
        expect(instructionCounts.size).toBeGreaterThan(3);
        expect(instructionCounts.has('SymDeclareInstruction')).toBe(true);
        expect(instructionCounts.has('SymAssignInstruction')).toBe(true);
        expect(instructionCounts.has('CallInstruction')).toBe(true);
    });
});
