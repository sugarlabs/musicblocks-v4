/**
 * @file Core validation utilities for Music Blocks parameters.
 *
 * This module provides comprehensive validation functions for all types of
 * block parameters including tempo, pitch, volume, note names, durations, etc.
 */

import type {
    IValidationResult,
    TValidationRule,
    IValidationRuleRange,
    IValidationRuleFormat,
    IValidationRuleType,
    IValidationRuleEnum,
    IValidationRuleCustom,
    IParameterValidationSchema,
    IBlockValidationSchema,
    IValidationState,
    TNoteName,
    TAccidental,
    IParsedNote,
} from '#/@types/validation';

// -- Constants ------------------------------------------------------------------------------------

/** Valid note names. */
const VALID_NOTE_NAMES: TNoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/** Valid accidentals. */
const VALID_ACCIDENTALS: TAccidental[] = ['#', 'b', '##', 'bb', ''];

/** Valid duration strings. */
const VALID_DURATIONS = [
    'whole',
    'half',
    'quarter',
    'eighth',
    'sixteenth',
    'thirty-second',
    '1',
    '1/2',
    '1/4',
    '1/8',
    '1/16',
    '1/32',
];

/** Pattern for matching note names with optional accidentals and octave. */
const NOTE_PATTERN = /^([A-Ga-g])(#{1,2}|b{1,2})?(\d)?$/;

/** Pattern for matching note names without octave. */
const NOTE_NAME_PATTERN = /^([A-Ga-g])(#{1,2}|b{1,2})?$/;

// -- Result Factory Functions ---------------------------------------------------------------------

/**
 * Creates a validation result object.
 * @param isValid - Whether the validation passed.
 * @param message - Optional error/warning message.
 * @param suggestion - Optional suggested valid value.
 * @param details - Optional additional details.
 * @returns A validation result object.
 */
export function createValidationResult(
    isValid: boolean,
    message?: string,
    suggestion?: string | number,
    details?: string,
): IValidationResult {
    return {
        isValid,
        status: isValid ? 'valid' : 'invalid',
        message,
        suggestion,
        details,
    };
}

/**
 * Creates a valid result.
 * @param message - Optional success message.
 * @returns A valid validation result.
 */
export function createValidResult(message?: string): IValidationResult {
    return {
        isValid: true,
        status: 'valid',
        message,
    };
}

/**
 * Creates an invalid result.
 * @param message - Error message.
 * @param suggestion - Optional suggested valid value.
 * @param details - Optional additional details.
 * @returns An invalid validation result.
 */
export function createInvalidResult(
    message: string,
    suggestion?: string | number,
    details?: string,
): IValidationResult {
    return {
        isValid: false,
        status: 'invalid',
        message,
        suggestion,
        details,
    };
}

// -- Type Validators ------------------------------------------------------------------------------

/**
 * Validates that a value is of the expected type.
 * @param value - The value to validate.
 * @param expectedType - The expected type.
 * @returns Validation result.
 */
export function validateType(
    value: unknown,
    expectedType: 'number' | 'string' | 'boolean' | 'array' | 'object',
): IValidationResult {
    let actualType: string;

    if (value === null) {
        actualType = 'null';
    } else if (Array.isArray(value)) {
        actualType = 'array';
    } else {
        actualType = typeof value;
    }

    if (actualType === expectedType) {
        return createValidResult();
    }

    return createInvalidResult(
        `Expected ${expectedType}, but received ${actualType}.`,
        undefined,
        `Value must be of type ${expectedType}.`,
    );
}

/**
 * Validates that a value is a number.
 * @param value - The value to validate.
 * @returns Validation result.
 */
export function validateNumber(value: unknown): IValidationResult {
    if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
        return createValidResult();
    }

    // Try to parse as number
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && isFinite(parsed)) {
            return createValidResult();
        }
    }

    return createInvalidResult(
        `"${value}" is not a valid number.`,
        undefined,
        'Please enter a numeric value.',
    );
}

/**
 * Validates that a value is a string.
 * @param value - The value to validate.
 * @returns Validation result.
 */
export function validateString(value: unknown): IValidationResult {
    if (typeof value === 'string') {
        return createValidResult();
    }

    return createInvalidResult(
        `Expected a text value, but received ${typeof value}.`,
        String(value),
        'Please enter a text value.',
    );
}

/**
 * Validates that a value is a boolean.
 * @param value - The value to validate.
 * @returns Validation result.
 */
export function validateBoolean(value: unknown): IValidationResult {
    if (typeof value === 'boolean') {
        return createValidResult();
    }

    // Accept string representations
    if (value === 'true' || value === 'false') {
        return createValidResult();
    }

    return createInvalidResult(
        `Expected true or false, but received "${value}".`,
        undefined,
        'Value must be true or false.',
    );
}

// -- Range Validators -----------------------------------------------------------------------------

/**
 * Validates that a numeric value is within a specified range.
 * @param value - The value to validate.
 * @param min - Minimum allowed value (inclusive).
 * @param max - Maximum allowed value (inclusive).
 * @param options - Additional options.
 * @returns Validation result.
 */
export function validateRange(
    value: unknown,
    min: number,
    max: number,
    options: { integerOnly?: boolean; unit?: string; paramName?: string } = {},
): IValidationResult {
    const { integerOnly = false, unit = '', paramName = 'Value' } = options;

    // First validate it's a number
    const numResult = validateNumber(value);
    if (!numResult.isValid) {
        return numResult;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : (value as number);

    // Check for integer if required
    if (integerOnly && !Number.isInteger(numValue)) {
        return createInvalidResult(
            `${paramName} must be a whole number. You entered: ${numValue}`,
            Math.round(numValue),
            `Enter a whole number between ${min} and ${max}${unit ? ` ${unit}` : ''}.`,
        );
    }

    // Check range
    if (numValue < min) {
        return createInvalidResult(
            `${paramName} must be at least ${min}${unit ? ` ${unit}` : ''}. You entered: ${numValue}`,
            min,
            `Valid range: ${min} to ${max}${unit ? ` ${unit}` : ''}.`,
        );
    }

    if (numValue > max) {
        return createInvalidResult(
            `${paramName} must be at most ${max}${unit ? ` ${unit}` : ''}. You entered: ${numValue}`,
            max,
            `Valid range: ${min} to ${max}${unit ? ` ${unit}` : ''}.`,
        );
    }

    return createValidResult(
        `Valid ${paramName.toLowerCase()}: ${numValue}${unit ? ` ${unit}` : ''}`,
    );
}

/**
 * Validates a tempo value (10-500 BPM).
 * @param value - The tempo value to validate.
 * @returns Validation result.
 */
export function validateTempo(value: unknown): IValidationResult {
    return validateRange(value, 10, 500, {
        integerOnly: true,
        unit: 'BPM',
        paramName: 'Tempo',
    });
}

/**
 * Validates a MIDI pitch value (0-127).
 * @param value - The pitch value to validate.
 * @returns Validation result.
 */
export function validatePitch(value: unknown): IValidationResult {
    return validateRange(value, 0, 127, {
        integerOnly: true,
        paramName: 'Pitch',
    });
}

/**
 * Validates a volume value (0-100).
 * @param value - The volume value to validate.
 * @returns Validation result.
 */
export function validateVolume(value: unknown): IValidationResult {
    return validateRange(value, 0, 100, {
        integerOnly: false,
        unit: '%',
        paramName: 'Volume',
    });
}

/**
 * Validates an octave value (0-9).
 * @param value - The octave value to validate.
 * @returns Validation result.
 */
export function validateOctave(value: unknown): IValidationResult {
    return validateRange(value, 0, 9, {
        integerOnly: true,
        paramName: 'Octave',
    });
}

// -- Format Validators ----------------------------------------------------------------------------

/**
 * Parses a note string into its components.
 * @param noteString - The note string to parse (e.g., "C#4", "Bb", "G").
 * @returns Parsed note object or null if invalid.
 */
export function parseNote(noteString: string): IParsedNote | null {
    const trimmed = noteString.trim();
    const match = trimmed.match(NOTE_PATTERN);

    if (!match) {
        return null;
    }

    const [, name, accidental = '', octaveStr] = match;
    const normalizedName = name.toUpperCase() as TNoteName;

    if (!VALID_NOTE_NAMES.includes(normalizedName)) {
        return null;
    }

    const normalizedAccidental = accidental as TAccidental;
    if (!VALID_ACCIDENTALS.includes(normalizedAccidental)) {
        return null;
    }

    const octave = octaveStr !== undefined ? parseInt(octaveStr, 10) : 4;

    if (octave < 0 || octave > 9) {
        return null;
    }

    return {
        name: normalizedName,
        accidental: normalizedAccidental,
        octave,
    };
}

/**
 * Validates a note name (without octave).
 * @param value - The note name to validate (e.g., "C", "C#", "Bb").
 * @returns Validation result.
 */
export function validateNoteName(value: unknown): IValidationResult {
    if (typeof value !== 'string') {
        return createInvalidResult(
            'Note name must be a text value.',
            'C',
            'Valid notes: C, D, E, F, G, A, B (with optional # or b)',
        );
    }

    const trimmed = value.trim();

    if (trimmed === '') {
        return createInvalidResult(
            'Note name cannot be empty.',
            'C',
            'Valid notes: C, D, E, F, G, A, B (with optional # or b)',
        );
    }

    const match = trimmed.match(NOTE_NAME_PATTERN);

    if (!match) {
        return createInvalidResult(
            `"${value}" is not a valid note name.`,
            'C',
            'Valid format: Note letter (A-G) with optional accidental (# or b). Examples: C, C#, Bb, F##',
        );
    }

    const [, name, accidental = ''] = match;
    const normalizedName = name.toUpperCase();

    if (!VALID_NOTE_NAMES.includes(normalizedName as TNoteName)) {
        return createInvalidResult(
            `"${name}" is not a valid note letter.`,
            'C',
            'Valid note letters: C, D, E, F, G, A, B',
        );
    }

    return createValidResult(`Valid note: ${normalizedName}${accidental}`);
}

/**
 * Validates a note with octave (e.g., "C4", "Bb3").
 * @param value - The note string to validate.
 * @returns Validation result.
 */
export function validateNoteWithOctave(value: unknown): IValidationResult {
    if (typeof value !== 'string') {
        return createInvalidResult(
            'Note must be a text value.',
            'C4',
            'Valid format: Note + Octave (e.g., C4, Bb3, F#5)',
        );
    }

    const parsed = parseNote(value);

    if (!parsed) {
        return createInvalidResult(
            `"${value}" is not a valid note.`,
            'C4',
            'Valid format: Note letter (A-G) + optional accidental (# or b) + octave (0-9). Examples: C4, Bb3, F#5',
        );
    }

    return createValidResult(
        `Valid note: ${parsed.name}${parsed.accidental}${parsed.octave}`,
    );
}

/**
 * Validates a duration value.
 * @param value - The duration to validate.
 * @returns Validation result.
 */
export function validateDuration(value: unknown): IValidationResult {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return createInvalidResult(
            'Duration must be a text or number value.',
            'quarter',
            `Valid durations: ${VALID_DURATIONS.join(', ')}`,
        );
    }

    const strValue = String(value).toLowerCase().trim();

    if (VALID_DURATIONS.includes(strValue)) {
        return createValidResult(`Valid duration: ${strValue}`);
    }

    // Also accept numeric values for beats
    if (typeof value === 'number' && value > 0) {
        return createValidResult(`Valid duration: ${value} beats`);
    }

    // Try parsing as a fraction
    const fractionMatch = strValue.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
        const [, numerator, denominator] = fractionMatch;
        if (parseInt(denominator, 10) !== 0) {
            return createValidResult(`Valid duration: ${strValue}`);
        }
    }

    return createInvalidResult(
        `"${value}" is not a valid duration.`,
        'quarter',
        `Valid durations: ${VALID_DURATIONS.join(', ')} or positive numbers.`,
    );
}

// -- Enum Validators ------------------------------------------------------------------------------

/**
 * Validates that a value is one of the allowed values.
 * @param value - The value to validate.
 * @param allowedValues - List of allowed values.
 * @param options - Additional options.
 * @returns Validation result.
 */
export function validateEnum(
    value: unknown,
    allowedValues: (string | number)[],
    options: { caseSensitive?: boolean; paramName?: string } = {},
): IValidationResult {
    const { caseSensitive = false, paramName = 'Value' } = options;

    const normalizedValue =
        !caseSensitive && typeof value === 'string' ? value.toLowerCase() : value;

    const normalizedAllowed = allowedValues.map((v) =>
        !caseSensitive && typeof v === 'string' ? v.toLowerCase() : v,
    );

    if (normalizedAllowed.includes(normalizedValue as string | number)) {
        return createValidResult(`Valid ${paramName.toLowerCase()}: ${value}`);
    }

    // Find closest match for suggestion
    let suggestion: string | number | undefined;
    if (typeof value === 'string') {
        const valueLower = value.toLowerCase();
        for (const allowed of allowedValues) {
            if (typeof allowed === 'string' && allowed.toLowerCase().startsWith(valueLower)) {
                suggestion = allowed;
                break;
            }
        }
    }

    return createInvalidResult(
        `"${value}" is not a valid ${paramName.toLowerCase()}.`,
        suggestion ?? allowedValues[0],
        `Allowed values: ${allowedValues.join(', ')}`,
    );
}

// -- Rule-based Validation ------------------------------------------------------------------------

/**
 * Applies a single validation rule to a value.
 * @param value - The value to validate.
 * @param rule - The validation rule to apply.
 * @returns Validation result.
 */
function applyRule(value: unknown, rule: TValidationRule): IValidationResult {
    // Handle required check
    if (rule.required && (value === undefined || value === null || value === '')) {
        return createInvalidResult(
            rule.errorMessage ?? 'This field is required.',
            undefined,
            'Please provide a value.',
        );
    }

    // Skip validation for empty non-required fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
        return createValidResult();
    }

    let result: IValidationResult;

    switch (rule.type) {
        case 'range': {
            const rangeRule = rule as IValidationRuleRange;
            result = validateRange(value, rangeRule.min, rangeRule.max, {
                integerOnly: rangeRule.integerOnly,
                unit: rangeRule.unit,
            });
            break;
        }
        case 'format': {
            const formatRule = rule as IValidationRuleFormat;
            if (typeof value !== 'string') {
                result = createInvalidResult('Value must be text.', formatRule.example);
            } else if (!formatRule.pattern.test(value)) {
                result = createInvalidResult(
                    rule.errorMessage ?? `Invalid format. ${formatRule.formatDescription}`,
                    formatRule.example,
                    `Example: ${formatRule.example}`,
                );
            } else {
                result = createValidResult();
            }
            break;
        }
        case 'type': {
            const typeRule = rule as IValidationRuleType;
            result = validateType(value, typeRule.expectedType);
            break;
        }
        case 'enum': {
            const enumRule = rule as IValidationRuleEnum;
            result = validateEnum(value, enumRule.allowedValues, {
                caseSensitive: enumRule.caseSensitive,
            });
            break;
        }
        case 'custom': {
            const customRule = rule as IValidationRuleCustom;
            result = customRule.validator(value);
            break;
        }
        default:
            result = createValidResult();
    }

    // Apply custom error message if provided
    if (!result.isValid && rule.errorMessage) {
        result = { ...result, message: rule.errorMessage };
    }

    return result;
}

/**
 * Validates a value using a generic validation function.
 * @param value - The value to validate.
 * @param rules - The validation rules to apply.
 * @returns Validation result (first failure or success).
 */
export function validate(value: unknown, rules: TValidationRule[]): IValidationResult {
    for (const rule of rules) {
        const result = applyRule(value, rule);
        if (!result.isValid) {
            return result;
        }
    }
    return createValidResult();
}

/**
 * Validates a parameter value against its schema.
 * @param value - The value to validate.
 * @param schema - The parameter validation schema.
 * @returns Validation result.
 */
export function validateParameter(
    value: unknown,
    schema: IParameterValidationSchema,
): IValidationResult {
    const result = validate(value, schema.rules);

    // Add parameter name context to error messages
    if (!result.isValid && result.message) {
        return {
            ...result,
            message: `${schema.label}: ${result.message}`,
        };
    }

    return result;
}

/**
 * Validates all parameters of a block against its schema.
 * @param values - Map of parameter name to value.
 * @param schema - The block validation schema.
 * @returns Validation state with all results.
 */
export function validateBlock(
    values: Record<string, unknown>,
    schema: IBlockValidationSchema,
): IValidationState {
    const results: Record<string, IValidationResult> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [paramName, paramSchema] of Object.entries(schema.parameters)) {
        const value = values[paramName] ?? paramSchema.defaultValue;
        const result = validateParameter(value, paramSchema);

        results[paramName] = result;

        if (!result.isValid && result.message) {
            errors.push(result.message);
        } else if (result.status === 'warning' && result.message) {
            warnings.push(result.message);
        }
    }

    return {
        isValid: errors.length === 0,
        results,
        errors,
        warnings,
    };
}

// -- Utility Functions ----------------------------------------------------------------------------

/**
 * Clamps a value to a specified range.
 * @param value - The value to clamp.
 * @param min - Minimum value.
 * @param max - Maximum value.
 * @returns Clamped value.
 */
export function clampToRange(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
