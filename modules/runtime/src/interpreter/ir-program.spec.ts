import { describe, it, expect } from 'vitest';
import { IRProgram } from './ir-program';
import { IRFunction } from './ir-function';

describe('IRProgram', () => {
    it('should be instantiated correctly with functions map', () => {
        const functions = new Map<string, IRFunction>();
        const program = new IRProgram(functions);

        expect(program).toBeInstanceOf(IRProgram);
        expect(program.functions).toBe(functions);
        expect(program.functions.size).toBe(0);
    });

    it('should store functions correctly', () => {
        const functions = new Map<string, IRFunction>();
        const testFunction = new IRFunction('test', []);
        functions.set('test', testFunction);

        const program = new IRProgram(functions);

        expect(program.functions.size).toBe(1);
        expect(program.functions.get('test')).toBe(testFunction);
    });
});
