import { describe, it, expect } from 'vitest';
import { ValidationEngine } from './validationEngine';

describe('ValidationEngine', () => {
    const engine = new ValidationEngine();

    it('allows top-bottom connection for any brick pair', () => {
        expect(engine.canConnect('Note', 'Compound', 'Pitch', 'Simple', 'top-bottom')).toEqual({
            isValid: true,
        });
        expect(engine.canConnect('Start', 'Simple', 'Note', 'Simple', 'top-bottom')).toEqual({
            isValid: true,
        });
    });

    it('allows Note to contain Pitch via nested', () => {
        expect(engine.canConnect('Note', 'Compound', 'Pitch', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
    });

    it('allows Note to contain Set Instrument via nested', () => {
        expect(engine.canConnect('Note', 'Compound', 'Set Instrument', 'Simple', 'nested')).toEqual(
            {
                isValid: true,
            },
        );
    });

    it('rejects placing Number inside Note via nested', () => {
        const result = engine.canConnect('Note', 'Compound', 'Number', 'Expression', 'nested');
        expect(result.isValid).toBe(false);
        expect(result.reason).toMatch(/cannot be placed/);
    });

    it('allows Flow blocks to contain any statement via nested', () => {
        expect(engine.canConnect('Repeat', 'Compound', 'Note', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
        expect(engine.canConnect('Forever', 'Compound', 'Pitch', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
        expect(engine.canConnect('If', 'Compound', 'Wait', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
    });

    it('allows Start to contain any statement via nested', () => {
        expect(engine.canConnect('Start', 'Compound', 'Note', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
    });

    it('rejects nesting an unrelated block inside Pitch', () => {
        const result = engine.canConnect('Pitch', 'Simple', 'Repeat', 'Compound', 'nested');
        expect(result.isValid).toBe(false);
    });

    it('allows Add expression to accept Number via right-left', () => {
        expect(
            engine.canConnect('Add', 'Expression', 'Number', 'Expression', 'right-left'),
        ).toEqual({
            isValid: true,
        });
    });

    it('allows Add expression to accept Boolean via right-left', () => {
        expect(
            engine.canConnect('Add', 'Expression', 'Boolean', 'Expression', 'right-left'),
        ).toEqual({
            isValid: true,
        });
    });

    it('rejects placing Start inside Add via right-left', () => {
        const result = engine.canConnect('Add', 'Expression', 'Start', 'Simple', 'right-left');
        expect(result.isValid).toBe(false);
    });

    it('allows nested Interval blocks to contain Pitch', () => {
        expect(
            engine.canConnect('Scalar Interval', 'Compound', 'Pitch', 'Simple', 'nested'),
        ).toEqual({ isValid: true });
    });

    it('allows Drum Set to contain Pitch', () => {
        expect(engine.canConnect('Set Drum', 'Compound', 'Pitch', 'Simple', 'nested')).toEqual({
            isValid: true,
        });
    });
});
