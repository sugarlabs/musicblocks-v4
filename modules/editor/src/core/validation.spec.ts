/**
 * @file Unit tests for editor validation integration.
 */

import { describe, it, expect } from 'vitest';
import {
    getInstructionSchema,
    registerInstructionSchema,
    validateInstruction,
    validateInstructionParameter,
    validateDynamicParameter,
    validateProgram,
    formatValidationErrors,
    createUserFriendlyError,
} from './validation';

// -- Schema Registry Tests ------------------------------------------------------------------------

describe('Schema Registry', () => {
    describe('getInstructionSchema', () => {
        it('should return schema for known instructions', () => {
            expect(getInstructionSchema('set-tempo')).toBeDefined();
            expect(getInstructionSchema('move-forward')).toBeDefined();
            expect(getInstructionSchema('repeat')).toBeDefined();
        });

        it('should return undefined for unknown instructions', () => {
            expect(getInstructionSchema('unknown-instruction')).toBeUndefined();
        });

        it('should be case-insensitive', () => {
            expect(getInstructionSchema('SET-TEMPO')).toBeDefined();
            expect(getInstructionSchema('Move-Forward')).toBeDefined();
        });
    });

    describe('registerInstructionSchema', () => {
        it('should register a new instruction schema', () => {
            const customSchema = {
                blockType: 'customBlock',
                blockName: 'Custom Block',
                parameters: {
                    value: {
                        name: 'value',
                        label: 'Value',
                        rules: [{ type: 'range' as const, min: 0, max: 50 }],
                    },
                },
            };

            registerInstructionSchema('custom-instruction', customSchema);
            expect(getInstructionSchema('custom-instruction')).toBeDefined();
        });
    });
});

// -- Instruction Validation Tests -----------------------------------------------------------------

describe('Instruction Validation', () => {
    describe('validateInstruction', () => {
        it('should validate set-tempo instruction', () => {
            // Valid tempo
            const validResult = validateInstruction('set-tempo', { tempo: 120 });
            expect(validResult.isValid).toBe(true);
            expect(validResult.formattedErrors).toHaveLength(0);

            // Invalid tempo (too low)
            const invalidResult = validateInstruction('set-tempo', { tempo: 5 });
            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.formattedErrors.length).toBeGreaterThan(0);
        });

        it('should validate move-forward instruction', () => {
            const validResult = validateInstruction('move-forward', { distance: 100 });
            expect(validResult.isValid).toBe(true);
        });

        it('should validate repeat instruction', () => {
            const validResult = validateInstruction('repeat', { times: 5 });
            expect(validResult.isValid).toBe(true);

            const invalidResult = validateInstruction('repeat', { times: -1 });
            expect(invalidResult.isValid).toBe(false);
        });

        it('should include line number in error messages', () => {
            const result = validateInstruction('set-tempo', { tempo: 600 }, 10);
            expect(result.lineNumber).toBe(10);
            expect(result.formattedErrors[0]).toContain('Line 10');
        });

        it('should pass unknown instructions (handled elsewhere)', () => {
            const result = validateInstruction('unknown-instruction', { foo: 'bar' });
            expect(result.isValid).toBe(true);
        });
    });

    describe('validateInstructionParameter', () => {
        it('should validate individual parameters', () => {
            expect(validateInstructionParameter('set-tempo', 'tempo', 120).isValid).toBe(true);
            expect(validateInstructionParameter('set-tempo', 'tempo', 600).isValid).toBe(false);
        });

        it('should pass unknown parameters', () => {
            expect(validateInstructionParameter('set-tempo', 'unknown', 'value').isValid).toBe(true);
        });
    });
});

// -- Dynamic Parameter Validation Tests -----------------------------------------------------------

describe('Dynamic Parameter Validation', () => {
    describe('validateDynamicParameter', () => {
        it('should detect and validate tempo parameters', () => {
            expect(validateDynamicParameter('tempo', 120).isValid).toBe(true);
            expect(validateDynamicParameter('bpm', 120).isValid).toBe(true);
            expect(validateDynamicParameter('tempo', 600).isValid).toBe(false);
        });

        it('should detect and validate pitch parameters', () => {
            expect(validateDynamicParameter('pitch', 60).isValid).toBe(true);
            expect(validateDynamicParameter('midi', 60).isValid).toBe(true);
            expect(validateDynamicParameter('pitch', 128).isValid).toBe(false);
        });

        it('should detect and validate volume parameters', () => {
            expect(validateDynamicParameter('volume', 80).isValid).toBe(true);
            expect(validateDynamicParameter('velocity', 50).isValid).toBe(true);
            expect(validateDynamicParameter('volume', 150).isValid).toBe(false);
        });

        it('should detect and validate note parameters', () => {
            expect(validateDynamicParameter('note', 'C4').isValid).toBe(true);
            expect(validateDynamicParameter('noteName', 'C').isValid).toBe(true);
        });

        it('should detect and validate angle parameters', () => {
            expect(validateDynamicParameter('angle', 90).isValid).toBe(true);
            expect(validateDynamicParameter('heading', 180).isValid).toBe(true);
        });

        it('should detect and validate distance parameters', () => {
            expect(validateDynamicParameter('distance', 100).isValid).toBe(true);
            expect(validateDynamicParameter('x', 50).isValid).toBe(true);
            expect(validateDynamicParameter('y', -50).isValid).toBe(true);
        });
    });
});

// -- Program Validation Tests ---------------------------------------------------------------------

describe('Program Validation', () => {
    describe('validateProgram', () => {
        it('should validate a valid program', () => {
            const instructions = [
                { name: 'set-tempo', parameters: { tempo: 120 } },
                { name: 'move-forward', parameters: { distance: 100 } },
                { name: 'turn-left', parameters: { angle: 90 } },
            ];

            const result = validateProgram(instructions);
            expect(result.isValid).toBe(true);
            expect(result.errorCount).toBe(0);
            expect(result.summary).toContain('✓');
        });

        it('should detect invalid instructions', () => {
            const instructions = [
                { name: 'set-tempo', parameters: { tempo: 120 }, lineNumber: 1 },
                { name: 'set-tempo', parameters: { tempo: -50 }, lineNumber: 2 },
                { name: 'move-forward', parameters: { distance: 100 }, lineNumber: 3 },
            ];

            const result = validateProgram(instructions);
            expect(result.isValid).toBe(false);
            expect(result.errorCount).toBe(1);
            expect(result.invalidInstructions).toHaveLength(1);
            expect(result.invalidInstructions[0].lineNumber).toBe(2);
        });

        it('should handle multiple errors', () => {
            const instructions = [
                { name: 'set-tempo', parameters: { tempo: -50 }, lineNumber: 1 },
                { name: 'set-tempo', parameters: { tempo: 600 }, lineNumber: 2 },
            ];

            const result = validateProgram(instructions);
            expect(result.isValid).toBe(false);
            expect(result.invalidInstructions).toHaveLength(2);
        });

        it('should handle empty program', () => {
            const result = validateProgram([]);
            expect(result.isValid).toBe(true);
            expect(result.errorCount).toBe(0);
        });
    });
});

// -- Error Formatting Tests -----------------------------------------------------------------------

describe('Error Formatting', () => {
    describe('formatValidationErrors', () => {
        it('should return empty string for valid program', () => {
            const result = {
                isValid: true,
                invalidInstructions: [],
                errorCount: 0,
                summary: '✓ All validated',
            };

            expect(formatValidationErrors(result)).toBe('');
        });

        it('should format errors for display', () => {
            const result = {
                isValid: false,
                invalidInstructions: [
                    {
                        instruction: 'set-tempo',
                        lineNumber: 5,
                        isValid: false,
                        state: { isValid: false, results: {}, errors: ['Error'], warnings: [] },
                        formattedErrors: ['Line 5: [Set Tempo] Tempo must be at least 10 BPM'],
                    },
                ],
                errorCount: 1,
                summary: '✕ Found 1 error',
            };

            const formatted = formatValidationErrors(result);
            expect(formatted).toContain('Line 5');
            expect(formatted).toContain('Set Tempo');
        });
    });

    describe('createUserFriendlyError', () => {
        it('should create formatted error message', () => {
            const result = {
                isValid: false,
                status: 'invalid' as const,
                message: 'Value must be at least 10',
                suggestion: 10,
                details: 'Valid range: 10 to 500',
            };

            const error = createUserFriendlyError('tempo', -5, result);
            expect(error).toContain('❌');
            expect(error).toContain('💡');
            expect(error).toContain('ℹ️');
            expect(error).toContain('10');
        });
    });
});
