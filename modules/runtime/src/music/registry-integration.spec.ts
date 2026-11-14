import { describe, it, expect } from 'vitest';
import { IRInterpreter } from '../interpreter/interpreter';
import { IRProgram } from '../interpreter/ir-program';
import { IRFunction } from '../interpreter/ir-function';
import { IRBasicBlock } from '../interpreter/ir-basic-block';
import { CallInstruction } from '../interpreter/instructions/call-instruction';
import { SingerFunctionRegistry } from '../execution/external-function-registry';

describe('SingerFunctionRegistry through the interpreter', () => {
    it('declares key going forward and scopes a volume change', () => {
        const functions = new Map<string, IRFunction>();
        functions.set(
            'start1',
            new IRFunction('start1', [
                new IRBasicBlock('entry', [
                    new CallInstruction('declareContext_key', ['g']),
                    new CallInstruction('setContext_volume', [30]),
                    new CallInstruction('resetContext_volume', []),
                ]),
            ]),
        );
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter(new SingerFunctionRegistry());
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.isHalted).toBe(true);
        // declare persists, the scoped volume change is restored.
        expect(context.music.key).toBe('g');
        expect(context.music.volume).toBe(50);
    });

    it('emits a note event for each playNote', () => {
        const functions = new Map<string, IRFunction>();
        functions.set(
            'start1',
            new IRFunction('start1', [
                new IRBasicBlock('entry', [
                    new CallInstruction('playNote', ['a', 0.25]),
                    new CallInstruction('playNote', ['g', 0.5]),
                ]),
            ]),
        );
        const program = new IRProgram(functions);

        const interpreter = new IRInterpreter(new SingerFunctionRegistry());
        interpreter.load(program);
        interpreter.run();

        const context = interpreter.getContext()!;
        expect(context.events).toHaveLength(2);
        expect(Math.round(context.events[0].hz)).toBe(440);
        expect(context.events[0].durationBeats).toBe(0.25);
        expect(context.events[1].durationBeats).toBe(0.5);
    });
});
