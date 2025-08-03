import { describe, it, expect, vi } from 'vitest';
import { CallInstruction } from './call-instruction';
import { ExecutionContext } from '../execution-context';
import { IRProgram } from '../ir-program';
import { IRFunction } from '../ir-function';
import { IRBasicBlock } from '../ir-basic-block';
import { SymDeclareInstruction } from './sym-declare-instruction';

describe('CallInstruction', () => {
    describe('Host Function Calls', () => {
        it('should be instantiated correctly for host functions', () => {
            const instruction = new CallInstruction('console.log', ['"Hello"'], true);

            expect(instruction).toBeInstanceOf(CallInstruction);
            expect(instruction.functionName).toBe('console.log');
            expect(instruction.parameters).toEqual(['"Hello"']);
            expect(instruction.isHostFunction).toBe(true);
        });

        it('should execute console.log host function', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const instruction = new CallInstruction('console.log', ['"Hello"', '"World"'], true);
            const program = new IRProgram(new Map());
            const context = new ExecutionContext(program);

            // Set initial instruction pointer
            context.instructionPointer.instructionIndex = 0;

            instruction.execute(context);

            expect(consoleSpy).toHaveBeenCalledWith('Hello', 'World');
            expect(context.instructionPointer.instructionIndex).toBe(1);

            consoleSpy.mockRestore();
        });

        it('should resolve variables from value store for host functions', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const instruction = new CallInstruction('console.log', ['myVar'], true);
            const program = new IRProgram(new Map());
            const context = new ExecutionContext(program);

            // Set a value in the value store
            context.valueStore.setValue('myVar', 'Hello from variable');

            instruction.execute(context);

            expect(consoleSpy).toHaveBeenCalledWith('Hello from variable');

            consoleSpy.mockRestore();
        });
    });

    describe('Function Calls', () => {
        it('should be instantiated correctly for function calls', () => {
            const instruction = new CallInstruction('myFunction', ['param1'], false);

            expect(instruction).toBeInstanceOf(CallInstruction);
            expect(instruction.functionName).toBe('myFunction');
            expect(instruction.parameters).toEqual(['param1']);
            expect(instruction.isHostFunction).toBe(false);
        });

        it('should create stack frame and jump to function', () => {
            const functions = new Map();
            const targetFunction = new IRFunction('myFunction', [
                new IRBasicBlock('entry', [new SymDeclareInstruction('localVar')]),
            ]);
            functions.set('myFunction', targetFunction);

            const instruction = new CallInstruction('myFunction', [], false);
            const program = new IRProgram(functions);
            const context = new ExecutionContext(program);

            // Set initial state
            context.instructionPointer.functionName = 'main';
            context.instructionPointer.blockLabel = 'entry';
            context.instructionPointer.instructionIndex = 5;

            instruction.execute(context);

            // Check that call stack was updated
            expect(context.callStack.length).toBe(1);
            expect(context.callStack[0].functionName).toBe('myFunction');
            expect(context.callStack[0].returnAddress.functionName).toBe('main');
            expect(context.callStack[0].returnAddress.blockLabel).toBe('entry');
            expect(context.callStack[0].returnAddress.instructionIndex).toBe(5);

            // Check that instruction pointer was updated
            expect(context.instructionPointer.functionName).toBe('myFunction');
            expect(context.instructionPointer.blockLabel).toBe('entry');
            expect(context.instructionPointer.instructionIndex).toBe(0);
        });

        it('should pass parameters for function calls', () => {
            const functions = new Map();
            const targetFunction = new IRFunction('testFunc', [
                new IRBasicBlock('entry', [new SymDeclareInstruction('param1')]),
            ]);
            functions.set('testFunc', targetFunction);

            const instruction = new CallInstruction('testFunc', ['42', 'myVar'], false);
            const program = new IRProgram(functions);
            const context = new ExecutionContext(program);

            // Set a variable value
            context.valueStore.setValue('myVar', 'hello');

            // Set initial state
            context.instructionPointer.functionName = 'main';
            context.instructionPointer.blockLabel = 'start';
            context.instructionPointer.instructionIndex = 0;

            instruction.execute(context);

            // Check that stack frame was created
            expect(context.callStack.length).toBe(1);
            expect(context.callStack[0].functionName).toBe('testFunc');
        });
    });

    describe('Literal Parsing', () => {
        it('should parse numeric literals correctly', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const instruction = new CallInstruction('console.log', ['42', '-3.14'], true);
            const program = new IRProgram(new Map());
            const context = new ExecutionContext(program);

            instruction.execute(context);

            expect(consoleSpy).toHaveBeenCalledWith(42, -3.14);

            consoleSpy.mockRestore();
        });

        it('should parse boolean literals correctly', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const instruction = new CallInstruction('console.log', ['true', 'false'], true);
            const program = new IRProgram(new Map());
            const context = new ExecutionContext(program);

            instruction.execute(context);

            expect(consoleSpy).toHaveBeenCalledWith(true, false);

            consoleSpy.mockRestore();
        });

        it('should parse string literals correctly', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const instruction = new CallInstruction('console.log', ['"Hello"', "'World'"], true);
            const program = new IRProgram(new Map());
            const context = new ExecutionContext(program);

            instruction.execute(context);

            expect(consoleSpy).toHaveBeenCalledWith('Hello', 'World');

            consoleSpy.mockRestore();
        });
    });
});
