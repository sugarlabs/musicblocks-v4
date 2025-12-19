/**
 * @file Comprehensive unit tests for validation utilities.
 */

import { describe, it, expect } from 'vitest';
import {
    // Core functions
    createValidationResult,
    createValidResult,
    createInvalidResult,
    validate,
    validateParameter,
    validateBlock,

    // Type validators
    validateType,
    validateNumber,
    validateString,
    validateBoolean,

    // Range validators
    validateRange,
    validateTempo,
    validatePitch,
    validateVolume,
    validateOctave,

    // Format validators
    validateNoteName,
    validateNoteWithOctave,
    validateDuration,
    parseNote,

    // Enum validators
    validateEnum,

    // Utilities
    clampToRange,
} from '../index';

import {
    TEMPO_SCHEMA,
    PITCH_SCHEMA,
    VOLUME_SCHEMA,
    OCTAVE_SCHEMA,
    NOTE_NAME_SCHEMA,
    DURATION_SCHEMA,
    NOTE_WITH_OCTAVE_SCHEMA,
    TEMPO_BLOCK_SCHEMA,
    PLAY_NOTE_BLOCK_SCHEMA,
} from '../schemas';

// -- Result Factory Tests -------------------------------------------------------------------------

describe('Result Factory Functions', () => {
    describe('createValidationResult', () => {
        it('should create a valid result', () => {
            const result = createValidationResult(true, 'Success');
            expect(result.isValid).toBe(true);
            expect(result.status).toBe('valid');
            expect(result.message).toBe('Success');
        });

        it('should create an invalid result', () => {
            const result = createValidationResult(false, 'Error', 42, 'Details');
            expect(result.isValid).toBe(false);
            expect(result.status).toBe('invalid');
            expect(result.message).toBe('Error');
            expect(result.suggestion).toBe(42);
            expect(result.details).toBe('Details');
        });
    });

    describe('createValidResult', () => {
        it('should create a valid result with optional message', () => {
            const result = createValidResult('All good');
            expect(result.isValid).toBe(true);
            expect(result.status).toBe('valid');
            expect(result.message).toBe('All good');
        });

        it('should create a valid result without message', () => {
            const result = createValidResult();
            expect(result.isValid).toBe(true);
            expect(result.status).toBe('valid');
            expect(result.message).toBeUndefined();
        });
    });

    describe('createInvalidResult', () => {
        it('should create an invalid result with all properties', () => {
            const result = createInvalidResult('Error message', 'suggestion', 'details');
            expect(result.isValid).toBe(false);
            expect(result.status).toBe('invalid');
            expect(result.message).toBe('Error message');
            expect(result.suggestion).toBe('suggestion');
            expect(result.details).toBe('details');
        });
    });
});

// -- Type Validators Tests ------------------------------------------------------------------------

describe('Type Validators', () => {
    describe('validateType', () => {
        it('should validate number type', () => {
            expect(validateType(42, 'number').isValid).toBe(true);
            expect(validateType('42', 'number').isValid).toBe(false);
        });

        it('should validate string type', () => {
            expect(validateType('hello', 'string').isValid).toBe(true);
            expect(validateType(42, 'string').isValid).toBe(false);
        });

        it('should validate boolean type', () => {
            expect(validateType(true, 'boolean').isValid).toBe(true);
            expect(validateType(false, 'boolean').isValid).toBe(true);
            expect(validateType('true', 'boolean').isValid).toBe(false);
        });

        it('should validate array type', () => {
            expect(validateType([1, 2, 3], 'array').isValid).toBe(true);
            expect(validateType({ a: 1 }, 'array').isValid).toBe(false);
        });

        it('should validate object type', () => {
            expect(validateType({ a: 1 }, 'object').isValid).toBe(true);
            expect(validateType([1, 2], 'object').isValid).toBe(false);
            expect(validateType(null, 'object').isValid).toBe(false);
        });
    });

    describe('validateNumber', () => {
        it('should accept valid numbers', () => {
            expect(validateNumber(42).isValid).toBe(true);
            expect(validateNumber(0).isValid).toBe(true);
            expect(validateNumber(-10).isValid).toBe(true);
            expect(validateNumber(3.14).isValid).toBe(true);
        });

        it('should accept numeric strings', () => {
            expect(validateNumber('42').isValid).toBe(true);
            expect(validateNumber('3.14').isValid).toBe(true);
            expect(validateNumber('-10').isValid).toBe(true);
        });

        it('should reject invalid numbers', () => {
            expect(validateNumber(NaN).isValid).toBe(false);
            expect(validateNumber(Infinity).isValid).toBe(false);
            expect(validateNumber('hello').isValid).toBe(false);
            expect(validateNumber({}).isValid).toBe(false);
        });
    });

    describe('validateString', () => {
        it('should accept strings', () => {
            expect(validateString('hello').isValid).toBe(true);
            expect(validateString('').isValid).toBe(true);
        });

        it('should reject non-strings', () => {
            expect(validateString(42).isValid).toBe(false);
            expect(validateString(null).isValid).toBe(false);
        });
    });

    describe('validateBoolean', () => {
        it('should accept booleans', () => {
            expect(validateBoolean(true).isValid).toBe(true);
            expect(validateBoolean(false).isValid).toBe(true);
        });

        it('should accept string representations', () => {
            expect(validateBoolean('true').isValid).toBe(true);
            expect(validateBoolean('false').isValid).toBe(true);
        });

        it('should reject invalid booleans', () => {
            expect(validateBoolean('yes').isValid).toBe(false);
            expect(validateBoolean(1).isValid).toBe(false);
        });
    });
});

// -- Range Validators Tests -----------------------------------------------------------------------

describe('Range Validators', () => {
    describe('validateRange', () => {
        it('should accept values within range', () => {
            expect(validateRange(50, 0, 100).isValid).toBe(true);
            expect(validateRange(0, 0, 100).isValid).toBe(true);
            expect(validateRange(100, 0, 100).isValid).toBe(true);
        });

        it('should reject values below minimum', () => {
            const result = validateRange(-10, 0, 100, { paramName: 'Value' });
            expect(result.isValid).toBe(false);
            expect(result.suggestion).toBe(0);
            expect(result.message).toContain('at least 0');
        });

        it('should reject values above maximum', () => {
            const result = validateRange(150, 0, 100, { paramName: 'Value' });
            expect(result.isValid).toBe(false);
            expect(result.suggestion).toBe(100);
            expect(result.message).toContain('at most 100');
        });

        it('should enforce integer-only constraint', () => {
            const result = validateRange(50.5, 0, 100, { integerOnly: true });
            expect(result.isValid).toBe(false);
            expect(result.suggestion).toBe(51);
            expect(result.message).toContain('whole number');
        });

        it('should include unit in messages', () => {
            const result = validateRange(600, 0, 500, { unit: 'BPM', paramName: 'Tempo' });
            expect(result.message).toContain('BPM');
            expect(result.details).toContain('BPM');
        });
    });

    describe('validateTempo', () => {
        it('should accept valid tempo values (10-500 BPM)', () => {
            expect(validateTempo(120).isValid).toBe(true);
            expect(validateTempo(10).isValid).toBe(true);
            expect(validateTempo(500).isValid).toBe(true);
        });

        it('should reject invalid tempo values', () => {
            expect(validateTempo(5).isValid).toBe(false);
            expect(validateTempo(600).isValid).toBe(false);
            expect(validateTempo(-50).isValid).toBe(false);
        });

        it('should provide helpful error message', () => {
            const result = validateTempo(-50);
            expect(result.message).toContain('Tempo');
            expect(result.message).toContain('-50');
            expect(result.suggestion).toBe(10);
        });

        it('should reject non-integer tempo', () => {
            expect(validateTempo(120.5).isValid).toBe(false);
        });
    });

    describe('validatePitch', () => {
        it('should accept valid MIDI pitch values (0-127)', () => {
            expect(validatePitch(60).isValid).toBe(true);
            expect(validatePitch(0).isValid).toBe(true);
            expect(validatePitch(127).isValid).toBe(true);
        });

        it('should reject invalid pitch values', () => {
            expect(validatePitch(-1).isValid).toBe(false);
            expect(validatePitch(128).isValid).toBe(false);
            expect(validatePitch(60.5).isValid).toBe(false);
        });
    });

    describe('validateVolume', () => {
        it('should accept valid volume values (0-100%)', () => {
            expect(validateVolume(80).isValid).toBe(true);
            expect(validateVolume(0).isValid).toBe(true);
            expect(validateVolume(100).isValid).toBe(true);
            expect(validateVolume(50.5).isValid).toBe(true); // Allows decimals
        });

        it('should reject invalid volume values', () => {
            expect(validateVolume(-10).isValid).toBe(false);
            expect(validateVolume(150).isValid).toBe(false);
        });
    });

    describe('validateOctave', () => {
        it('should accept valid octave values (0-9)', () => {
            expect(validateOctave(4).isValid).toBe(true);
            expect(validateOctave(0).isValid).toBe(true);
            expect(validateOctave(9).isValid).toBe(true);
        });

        it('should reject invalid octave values', () => {
            expect(validateOctave(-1).isValid).toBe(false);
            expect(validateOctave(10).isValid).toBe(false);
            expect(validateOctave(4.5).isValid).toBe(false);
        });
    });
});

// -- Format Validators Tests ----------------------------------------------------------------------

describe('Format Validators', () => {
    describe('parseNote', () => {
        it('should parse simple note names', () => {
            const result = parseNote('C4');
            expect(result).toEqual({ name: 'C', accidental: '', octave: 4 });
        });

        it('should parse notes with sharps', () => {
            expect(parseNote('C#4')).toEqual({ name: 'C', accidental: '#', octave: 4 });
            expect(parseNote('F##3')).toEqual({ name: 'F', accidental: '##', octave: 3 });
        });

        it('should parse notes with flats', () => {
            expect(parseNote('Bb3')).toEqual({ name: 'B', accidental: 'b', octave: 3 });
            expect(parseNote('Ebb5')).toEqual({ name: 'E', accidental: 'bb', octave: 5 });
        });

        it('should handle lowercase note names', () => {
            expect(parseNote('c4')).toEqual({ name: 'C', accidental: '', octave: 4 });
            expect(parseNote('g#5')).toEqual({ name: 'G', accidental: '#', octave: 5 });
        });

        it('should default to octave 4 when not specified', () => {
            expect(parseNote('C')).toEqual({ name: 'C', accidental: '', octave: 4 });
        });

        it('should return null for invalid notes', () => {
            expect(parseNote('H4')).toBeNull();
            expect(parseNote('C10')).toBeNull();
            expect(parseNote('')).toBeNull();
            expect(parseNote('##C')).toBeNull();
        });
    });

    describe('validateNoteName', () => {
        it('should accept valid note names', () => {
            expect(validateNoteName('C').isValid).toBe(true);
            expect(validateNoteName('D#').isValid).toBe(true);
            expect(validateNoteName('Bb').isValid).toBe(true);
            expect(validateNoteName('F##').isValid).toBe(true);
            expect(validateNoteName('g').isValid).toBe(true);
        });

        it('should reject invalid note names', () => {
            expect(validateNoteName('H').isValid).toBe(false);
            expect(validateNoteName('C4').isValid).toBe(false); // Has octave
            expect(validateNoteName('').isValid).toBe(false);
            expect(validateNoteName(123).isValid).toBe(false);
        });

        it('should provide helpful suggestions', () => {
            const result = validateNoteName('X');
            expect(result.suggestion).toBe('C');
        });
    });

    describe('validateNoteWithOctave', () => {
        it('should accept valid notes with octave', () => {
            expect(validateNoteWithOctave('C4').isValid).toBe(true);
            expect(validateNoteWithOctave('Bb3').isValid).toBe(true);
            expect(validateNoteWithOctave('F#5').isValid).toBe(true);
            expect(validateNoteWithOctave('G0').isValid).toBe(true);
            expect(validateNoteWithOctave('A9').isValid).toBe(true);
        });

        it('should reject invalid notes', () => {
            expect(validateNoteWithOctave('C').isValid).toBe(false); // No octave
            expect(validateNoteWithOctave('C10').isValid).toBe(false); // Invalid octave
            expect(validateNoteWithOctave('H4').isValid).toBe(false); // Invalid note
            expect(validateNoteWithOctave('').isValid).toBe(false);
        });
    });

    describe('validateDuration', () => {
        it('should accept valid duration names', () => {
            expect(validateDuration('whole').isValid).toBe(true);
            expect(validateDuration('half').isValid).toBe(true);
            expect(validateDuration('quarter').isValid).toBe(true);
            expect(validateDuration('eighth').isValid).toBe(true);
            expect(validateDuration('sixteenth').isValid).toBe(true);
            expect(validateDuration('thirty-second').isValid).toBe(true);
        });

        it('should accept fractional durations', () => {
            expect(validateDuration('1').isValid).toBe(true);
            expect(validateDuration('1/2').isValid).toBe(true);
            expect(validateDuration('1/4').isValid).toBe(true);
            expect(validateDuration('1/8').isValid).toBe(true);
        });

        it('should accept numeric beat values', () => {
            expect(validateDuration(1).isValid).toBe(true);
            expect(validateDuration(0.5).isValid).toBe(true);
            expect(validateDuration(2).isValid).toBe(true);
        });

        it('should be case-insensitive', () => {
            expect(validateDuration('QUARTER').isValid).toBe(true);
            expect(validateDuration('Half').isValid).toBe(true);
        });

        it('should reject invalid durations', () => {
            expect(validateDuration('invalid').isValid).toBe(false);
            expect(validateDuration(-1).isValid).toBe(false);
            expect(validateDuration(0).isValid).toBe(false);
        });
    });
});

// -- Enum Validators Tests ------------------------------------------------------------------------

describe('Enum Validators', () => {
    describe('validateEnum', () => {
        const allowedValues = ['red', 'green', 'blue'];

        it('should accept allowed values', () => {
            expect(validateEnum('red', allowedValues).isValid).toBe(true);
            expect(validateEnum('green', allowedValues).isValid).toBe(true);
            expect(validateEnum('blue', allowedValues).isValid).toBe(true);
        });

        it('should be case-insensitive by default', () => {
            expect(validateEnum('RED', allowedValues).isValid).toBe(true);
            expect(validateEnum('Red', allowedValues).isValid).toBe(true);
        });

        it('should respect case sensitivity option', () => {
            expect(
                validateEnum('RED', allowedValues, { caseSensitive: true }).isValid,
            ).toBe(false);
        });

        it('should reject disallowed values', () => {
            const result = validateEnum('yellow', allowedValues);
            expect(result.isValid).toBe(false);
            expect(result.details).toContain('red');
        });

        it('should suggest closest match', () => {
            const result = validateEnum('re', allowedValues);
            expect(result.suggestion).toBe('red');
        });

        it('should work with numeric values', () => {
            expect(validateEnum(1, [1, 2, 3]).isValid).toBe(true);
            expect(validateEnum(4, [1, 2, 3]).isValid).toBe(false);
        });
    });
});

// -- Schema Validation Tests ----------------------------------------------------------------------

describe('Schema Validation', () => {
    describe('validateParameter', () => {
        it('should validate against parameter schema', () => {
            expect(validateParameter(120, TEMPO_SCHEMA).isValid).toBe(true);
            expect(validateParameter(600, TEMPO_SCHEMA).isValid).toBe(false);
        });

        it('should include parameter label in error message', () => {
            const result = validateParameter(600, TEMPO_SCHEMA);
            expect(result.message).toContain('Tempo');
        });
    });

    describe('validateBlock', () => {
        it('should validate all block parameters', () => {
            const result = validateBlock({ tempo: 120 }, TEMPO_BLOCK_SCHEMA);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should collect all validation errors', () => {
            const result = validateBlock(
                { note: 'X4', duration: 'invalid', volume: 150 },
                PLAY_NOTE_BLOCK_SCHEMA,
            );
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should use default values when not provided', () => {
            const result = validateBlock({}, TEMPO_BLOCK_SCHEMA);
            // Default tempo is 120, which is valid
            expect(result.isValid).toBe(true);
        });
    });
});

// -- Pre-defined Schemas Tests --------------------------------------------------------------------

describe('Pre-defined Schemas', () => {
    it('TEMPO_SCHEMA should have correct defaults', () => {
        expect(TEMPO_SCHEMA.defaultValue).toBe(120);
        expect(TEMPO_SCHEMA.label).toBe('Tempo');
    });

    it('PITCH_SCHEMA should have correct range', () => {
        expect(validateParameter(0, PITCH_SCHEMA).isValid).toBe(true);
        expect(validateParameter(127, PITCH_SCHEMA).isValid).toBe(true);
        expect(validateParameter(128, PITCH_SCHEMA).isValid).toBe(false);
    });

    it('VOLUME_SCHEMA should allow decimals', () => {
        expect(validateParameter(50.5, VOLUME_SCHEMA).isValid).toBe(true);
    });

    it('OCTAVE_SCHEMA should only allow integers', () => {
        expect(validateParameter(4, OCTAVE_SCHEMA).isValid).toBe(true);
        expect(validateParameter(4.5, OCTAVE_SCHEMA).isValid).toBe(false);
    });

    it('NOTE_NAME_SCHEMA should match format pattern', () => {
        expect(validateParameter('C', NOTE_NAME_SCHEMA).isValid).toBe(true);
        expect(validateParameter('C#', NOTE_NAME_SCHEMA).isValid).toBe(true);
        expect(validateParameter('C4', NOTE_NAME_SCHEMA).isValid).toBe(false);
    });

    it('DURATION_SCHEMA should accept all valid durations', () => {
        expect(validateParameter('quarter', DURATION_SCHEMA).isValid).toBe(true);
        expect(validateParameter('1/4', DURATION_SCHEMA).isValid).toBe(true);
    });

    it('NOTE_WITH_OCTAVE_SCHEMA should require octave', () => {
        expect(validateParameter('C4', NOTE_WITH_OCTAVE_SCHEMA).isValid).toBe(true);
        expect(validateParameter('C', NOTE_WITH_OCTAVE_SCHEMA).isValid).toBe(false);
    });
});

// -- Utility Functions Tests ----------------------------------------------------------------------

describe('Utility Functions', () => {
    describe('clampToRange', () => {
        it('should clamp values below minimum', () => {
            expect(clampToRange(-10, 0, 100)).toBe(0);
        });

        it('should clamp values above maximum', () => {
            expect(clampToRange(150, 0, 100)).toBe(100);
        });

        it('should leave values within range unchanged', () => {
            expect(clampToRange(50, 0, 100)).toBe(50);
        });

        it('should handle edge cases', () => {
            expect(clampToRange(0, 0, 100)).toBe(0);
            expect(clampToRange(100, 0, 100)).toBe(100);
        });
    });
});

// -- Rule-based Validation Tests ------------------------------------------------------------------

describe('Rule-based Validation', () => {
    describe('validate', () => {
        it('should apply multiple rules in order', () => {
            const rules = [
                { type: 'type' as const, expectedType: 'number' as const },
                { type: 'range' as const, min: 0, max: 100 },
            ];

            expect(validate(50, rules).isValid).toBe(true);
            expect(validate('50', rules).isValid).toBe(false); // Fails type check
            expect(validate(150, rules).isValid).toBe(false); // Fails range check
        });

        it('should stop on first failure', () => {
            const rules = [
                { type: 'type' as const, expectedType: 'string' as const },
                { type: 'format' as const, pattern: /^[A-Z]+$/, formatDescription: 'uppercase', example: 'ABC' },
            ];

            const result = validate(123, rules);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('string');
        });

        it('should handle required fields', () => {
            const rules = [{ type: 'range' as const, min: 0, max: 100, required: true }];

            expect(validate(undefined, rules).isValid).toBe(false);
            expect(validate(null, rules).isValid).toBe(false);
            expect(validate('', rules).isValid).toBe(false);
        });

        it('should skip validation for empty non-required fields', () => {
            const rules = [{ type: 'range' as const, min: 0, max: 100, required: false }];

            expect(validate(undefined, rules).isValid).toBe(true);
            expect(validate('', rules).isValid).toBe(true);
        });

        it('should apply custom error messages', () => {
            const rules = [
                {
                    type: 'range' as const,
                    min: 0,
                    max: 100,
                    errorMessage: 'Custom error message',
                },
            ];

            const result = validate(150, rules);
            expect(result.message).toBe('Custom error message');
        });
    });
});
