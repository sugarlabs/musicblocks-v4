/**
 * Type definitions for the validation system.
 */

// -- Validation Result Types ----------------------------------------------------------------------

/** Status of a validation check. */
export type TValidationStatus = 'valid' | 'invalid' | 'warning';

/** Result of a validation check. */
export interface IValidationResult {
    /** Whether the validation passed. */
    isValid: boolean;
    /** Validation status: valid, invalid, or warning. */
    status: TValidationStatus;
    /** Error or warning message if validation failed or has warnings. */
    message?: string;
    /** Suggested valid value if the input was invalid. */
    suggestion?: string | number;
    /** Additional details about valid input format/range. */
    details?: string;
}

// -- Validation Rule Types ------------------------------------------------------------------------

/** Type of validation rule. */
export type TValidationRuleType = 'range' | 'format' | 'type' | 'enum' | 'custom';

/** Base interface for validation rules. */
export interface IValidationRuleBase {
    /** Type of validation rule. */
    type: TValidationRuleType;
    /** Whether this field is required. */
    required?: boolean;
    /** Custom error message override. */
    errorMessage?: string;
}

/** Range validation rule for numeric values. */
export interface IValidationRuleRange extends IValidationRuleBase {
    type: 'range';
    /** Minimum allowed value (inclusive). */
    min: number;
    /** Maximum allowed value (inclusive). */
    max: number;
    /** Whether only integers are allowed. */
    integerOnly?: boolean;
    /** Unit label for display (e.g., 'BPM', 'Hz'). */
    unit?: string;
}

/** Format validation rule for string patterns. */
export interface IValidationRuleFormat extends IValidationRuleBase {
    type: 'format';
    /** Regular expression pattern to match. */
    pattern: RegExp;
    /** Description of the expected format. */
    formatDescription: string;
    /** Example of a valid value. */
    example: string;
}

/** Type validation rule to ensure correct data type. */
export interface IValidationRuleType extends IValidationRuleBase {
    type: 'type';
    /** Expected data type. */
    expectedType: 'number' | 'string' | 'boolean' | 'array' | 'object';
}

/** Enum validation rule for a set of allowed values. */
export interface IValidationRuleEnum extends IValidationRuleBase {
    type: 'enum';
    /** List of allowed values. */
    allowedValues: (string | number)[];
    /** Whether the comparison is case-sensitive (for strings). */
    caseSensitive?: boolean;
}

/** Custom validation rule with a validator function. */
export interface IValidationRuleCustom extends IValidationRuleBase {
    type: 'custom';
    /** Custom validation function. */
    validator: (value: unknown) => IValidationResult;
}

/** Union type for all validation rules. */
export type TValidationRule =
    | IValidationRuleRange
    | IValidationRuleFormat
    | IValidationRuleType
    | IValidationRuleEnum
    | IValidationRuleCustom;

// -- Validation Schema Types ----------------------------------------------------------------------

/** Schema for validating a block parameter. */
export interface IParameterValidationSchema {
    /** Parameter name/identifier. */
    name: string;
    /** Display label for the parameter. */
    label: string;
    /** List of validation rules to apply (in order). */
    rules: TValidationRule[];
    /** Default value if none provided. */
    defaultValue?: unknown;
}

/** Schema for validating an entire block. */
export interface IBlockValidationSchema {
    /** Block type identifier. */
    blockType: string;
    /** Display name of the block. */
    blockName: string;
    /** Map of parameter name to validation schema. */
    parameters: Record<string, IParameterValidationSchema>;
}

// -- Music-specific Validation Types --------------------------------------------------------------

/** Valid note names (without octave). */
export type TNoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

/** Valid accidentals. */
export type TAccidental = '#' | 'b' | '##' | 'bb' | '';

/** Valid octave range. */
export type TOctave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/** Valid duration values. */
export type TDuration =
    | 'whole'
    | 'half'
    | 'quarter'
    | 'eighth'
    | 'sixteenth'
    | 'thirty-second'
    | '1'
    | '1/2'
    | '1/4'
    | '1/8'
    | '1/16'
    | '1/32';

/** Parsed note value. */
export interface IParsedNote {
    /** Note name (C, D, E, F, G, A, B). */
    name: TNoteName;
    /** Accidental (sharp, flat, double sharp, double flat). */
    accidental: TAccidental;
    /** Octave number. */
    octave: number;
}

// -- Validation Event Types -----------------------------------------------------------------------

/** Event types for validation triggers. */
export type TValidationTrigger = 'change' | 'blur' | 'submit';

/** Validation state for a form/block. */
export interface IValidationState {
    /** Whether all validations pass. */
    isValid: boolean;
    /** Map of parameter name to validation result. */
    results: Record<string, IValidationResult>;
    /** List of all error messages. */
    errors: string[];
    /** List of all warning messages. */
    warnings: string[];
}
