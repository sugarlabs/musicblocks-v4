import { Parser } from './parser';
import { ThreadFunctionDeclaration } from '../ast/function/ThreadFunctionDeclaration';
import { CustomFunctionDeclaration } from '../ast/function/CustomFunctionDeclaration';
import { Block } from '../ast/Block';
import { VariableDeclarationStatement } from '../ast/statement/VariableDeclarationStatement';
import { FunctionCallStatement } from '../ast/statement/FunctionCallStatement';
import { IdentifierExpression } from '../ast/expression/IdentifierExpression';
import { NumericLiteralExpression } from '../ast/expression/NumericLiteralExpression';
import { StringLiteralExpression } from '../ast/expression/StringLiteralExpression';
import { BooleanLiteralExpression } from '../ast/expression/BooleanLiteralExpression';
import { BinaryOperatorExpression } from '../ast/expression/BinaryOperatorExpression';
import { UnaryOperatorExpression } from '../ast/expression/UnaryOperatorExpression';
import { Compiler } from './compiler';
import { createMusicBlocksProgram } from '../examples/MusicBlocksProgram';
import { createMusicBlocksProgram2 } from '../examples/MusicBlocksProgram2';

describe('Parser', () => {
    let parser: Parser;

    beforeEach(() => {
        parser = new Parser();
    });

    it('should be defined', () => {
        expect(parser).toBeDefined();
    });

    it('should compile thread function declarations', () => {
        const block = new Block([
            new VariableDeclarationStatement(
                new IdentifierExpression('x'),
                new NumericLiteralExpression(5),
            ),
        ]);
        const threadFunction = new ThreadFunctionDeclaration(block);

        const irFunction = parser.compileFunction(threadFunction);

        expect(irFunction).toBeDefined();
        expect(irFunction.blocks).toBeDefined();
        expect(irFunction.blocks.length).toBeGreaterThan(0);
    });

    it('should compile custom function declarations', () => {
        const block = new Block([
            new FunctionCallStatement(new IdentifierExpression('doSomething'), []),
        ]);
        const customFunction = new CustomFunctionDeclaration(
            new IdentifierExpression('myFunction'),
            [],
            block,
        );

        const irFunction = parser.compileFunction(customFunction);

        expect(irFunction).toBeDefined();
        expect(irFunction.blocks).toBeDefined();
        expect(irFunction.blocks.length).toBeGreaterThan(0);
    });

    it('should compile variable declarations with different literal types', () => {
        const block = new Block([
            new VariableDeclarationStatement(
                new IdentifierExpression('numVar'),
                new NumericLiteralExpression(42),
            ),
            new VariableDeclarationStatement(
                new IdentifierExpression('strVar'),
                new StringLiteralExpression('hello'),
            ),
            new VariableDeclarationStatement(
                new IdentifierExpression('boolVar'),
                new BooleanLiteralExpression(true),
            ),
        ]);
        const threadFunction = new ThreadFunctionDeclaration(block);

        const irFunction = parser.compileFunction(threadFunction);

        expect(irFunction.blocks[0].instructions.length).toBeGreaterThanOrEqual(6);
    });

    it('should compile complex expressions', () => {
        const binaryOp = new BinaryOperatorExpression(
            'add',
            new NumericLiteralExpression(5),
            new NumericLiteralExpression(3),
        );
        const unaryOp = new UnaryOperatorExpression('sqrt', new NumericLiteralExpression(16));

        const block = new Block([
            new VariableDeclarationStatement(new IdentifierExpression('result1'), binaryOp),
            new VariableDeclarationStatement(new IdentifierExpression('result2'), unaryOp),
        ]);
        const threadFunction = new ThreadFunctionDeclaration(block);

        const irFunction = parser.compileFunction(threadFunction);

        expect(irFunction.blocks[0].instructions.length).toBeGreaterThanOrEqual(4);
    });

    it('should work with Compiler to parse the example Music Blocks program', () => {
        const compiler = new Compiler();
        const program = createMusicBlocksProgram();

        const irProgram = compiler.compile(program);

        expect(irProgram).toBeDefined();
        expect(irProgram.functions.size).toBe(5);
    });

    it('should work with Compiler to parse the MusicBlocksProgram2 example', () => {
        const compiler = new Compiler();
        const program = createMusicBlocksProgram2();

        const irProgram = compiler.compile(program);

        expect(irProgram).toBeDefined();
        expect(irProgram.functions.size).toBe(5);
        expect(irProgram.functions.has('start1')).toBe(true);
        expect(irProgram.functions.has('start2')).toBe(true);
        expect(irProgram.functions.has('action')).toBe(true);
        expect(irProgram.functions.has('action1')).toBe(true);
        expect(irProgram.functions.has('action2')).toBe(true);
    });
});
