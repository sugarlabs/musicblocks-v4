/**
 * @file Validation integration for the Editor component.
 *
 * This module provides validation utilities for validating code instructions
 * and their parameters before execution.
 */

import type {
    IValidationResult,
    IValidationState,
    IBlockValidationSchema,
    IParameterValidationSchema,
} from '#/@types/validation';

import {
    validateParameter,
    validateBlock,
    createValidResult,
    createInvalidResult,
    validateTempo,
    validatePitch,
    validateVolume,
    validateNoteName,
    validateNoteWithOctave,
    validateDuration,
    validateRange,
    validateNumber,
} from '@sugarlabs/mb4-validation';

import {
    TEMPO_BLOCK_SCHEMA,
    PLAY_NOTE_BLOCK_SCHEMA,
    SET_PITCH_BLOCK_SCHEMA,
    SET_VOLUME_BLOCK_SCHEMA,
    SET_OCTAVE_BLOCK_SCHEMA,
    MOVE_FORWARD_BLOCK_SCHEMA,
    TURN_BLOCK_SCHEMA,
    SET_COLOR_BLOCK_SCHEMA,
    SET_THICKNESS_BLOCK_SCHEMA,
    REPEAT_BLOCK_SCHEMA,
} from '@sugarlabs/mb4-validation';

// -- Types ----------------------------------------------------------------------------------------

/** Map of instruction name to its validation schema. */
const INSTRUCTION_SCHEMAS: Record<string, IBlockValidationSchema> = {
    'set-tempo': TEMPO_BLOCK_SCHEMA,
    'play-note': PLAY_NOTE_BLOCK_SCHEMA,
    'set-pitch': SET_PITCH_BLOCK_SCHEMA,
    'set-volume': SET_VOLUME_BLOCK_SCHEMA,
    'set-octave': SET_OCTAVE_BLOCK_SCHEMA,
    'move-forward': MOVE_FORWARD_BLOCK_SCHEMA,
    'move-backward': {
        ...MOVE_FORWARD_BLOCK_SCHEMA,
        blockType: 'moveBackward',
        blockName: 'Move Backward',
    },
    'turn-left': TURN_BLOCK_SCHEMA,
    'turn-right': TURN_BLOCK_SCHEMA,
    'set-color': SET_COLOR_BLOCK_SCHEMA,
    'set-thickness': SET_THICKNESS_BLOCK_SCHEMA,
    'repeat': REPEAT_BLOCK_SCHEMA,
};

/** Result of validating an instruction. */
export interface IInstructionValidationResult {
    /** Instruction name. */
    instruction: string;
    /** Line number (if available). */
    lineNumber?: number;
    /** Overall validation result. */
    isValid: boolean;
    /** Validation state with all parameter results. */
    state: IValidationState;
    /** Formatted error messages for display. */
    formattedErrors: string[];
}

/** Result of validating a program. */
export interface IProgramValidationResult {
    /** Whether all instructions are valid. */
    isValid: boolean;
    /** List of validation results for each invalid instruction. */
    invalidInstructions: IInstructionValidationResult[];
    /** Total error count. */
    errorCount: number;
    /** Formatted summary message. */
    summary: string;
}

// -- Schema Registry ------------------------------------------------------------------------------

/**
 * Gets the validation schema for an instruction.
 * @param instructionName - The name of the instruction.
 * @returns The validation schema or undefined if not found.
 */
export function getInstructionSchema(
    instructionName: string,
): IBlockValidationSchema | undefined {
    return INSTRUCTION_SCHEMAS[instructionName.toLowerCase()];
}

/**
 * Registers a custom validation schema for an instruction.
 * @param instructionName - The name of the instruction.
 * @param schema - The validation schema.
 */
export function registerInstructionSchema(
    instructionName: string,
    schema: IBlockValidationSchema,
): void {
    INSTRUCTION_SCHEMAS[instructionName.toLowerCase()] = schema;
}

/**
 * Gets all registered instruction schemas.
 * @returns Map of instruction names to schemas.
 */
export function getAllInstructionSchemas(): Record<string, IBlockValidationSchema> {
    return { ...INSTRUCTION_SCHEMAS };
}

// -- Instruction Validation -----------------------------------------------------------------------

/**
 * Validates an instruction's parameters.
 * @param instructionName - The name of the instruction.
 * @param parameters - Map of parameter name to value.
 * @param lineNumber - Optional line number for error reporting.
 * @returns Validation result for the instruction.
 */
export function validateInstruction(
    instructionName: string,
    parameters: Record<string, unknown>,
    lineNumber?: number,
): IInstructionValidationResult {
    const schema = getInstructionSchema(instructionName);

    // If no schema exists, assume valid (unknown instruction types handled elsewhere)
    if (!schema) {
        return {
            instruction: instructionName,
            lineNumber,
            isValid: true,
            state: {
                isValid: true,
                results: {},
                errors: [],
                warnings: [],
            },
            formattedErrors: [],
        };
    }

    const state = validateBlock(parameters, schema);

    const formattedErrors = state.errors.map((error) => {
        const linePrefix = lineNumber !== undefined ? `Line ${lineNumber}: ` : '';
        return `${linePrefix}[${schema.blockName}] ${error}`;
    });

    return {
        instruction: instructionName,
        lineNumber,
        isValid: state.isValid,
        state,
        formattedErrors,
    };
}

/**
 * Validates a single parameter value for an instruction.
 * @param instructionName - The instruction name.
 * @param parameterName - The parameter name.
 * @param value - The value to validate.
 * @returns Validation result.
 */
export function validateInstructionParameter(
    instructionName: string,
    parameterName: string,
    value: unknown,
): IValidationResult {
    const schema = getInstructionSchema(instructionName);

    if (!schema) {
        return createValidResult();
    }

    const paramSchema = schema.parameters[parameterName];

    if (!paramSchema) {
        return createValidResult();
    }

    return validateParameter(value, paramSchema);
}

// -- Parameter Type Detection ---------------------------------------------------------------------

/**
 * Detects the parameter type and validates accordingly.
 * This is useful for dynamic validation when the parameter type is unknown.
 * @param parameterName - The parameter name (used as hint).
 * @param value - The value to validate.
 * @returns Validation result.
 */
export function validateDynamicParameter(
    parameterName: string,
    value: unknown,
): IValidationResult {
    const lowerName = parameterName.toLowerCase();

    // Tempo-like parameters
    if (lowerName.includes('tempo') || lowerName.includes('bpm')) {
        return validateTempo(value);
    }

    // Pitch-like parameters
    if (lowerName.includes('pitch') || lowerName === 'midi') {
        return validatePitch(value);
    }

    // Volume-like parameters
    if (lowerName.includes('volume') || lowerName.includes('velocity')) {
        return validateVolume(value);
    }

    // Note-like parameters
    if (lowerName === 'note' || lowerName.includes('notename')) {
        // Check if it includes octave
        if (typeof value === 'string' && /\d$/.test(value)) {
            return validateNoteWithOctave(value);
        }
        return validateNoteName(value);
    }

    // Duration-like parameters
    if (lowerName.includes('duration') || lowerName.includes('length')) {
        return validateDuration(value);
    }

    // Distance/position parameters
    if (
        lowerName.includes('distance') ||
        lowerName.includes('position') ||
        lowerName === 'x' ||
        lowerName === 'y'
    ) {
        return validateRange(value, -10000, 10000, { paramName: parameterName });
    }

    // Angle parameters
    if (lowerName.includes('angle') || lowerName.includes('heading')) {
        return validateRange(value, -360, 360, { paramName: parameterName, unit: 'degrees' });
    }

    // Color parameters
    if (lowerName.includes('color') || lowerName.includes('hue')) {
        return validateRange(value, 0, 100, { paramName: parameterName });
    }

    // Thickness/size parameters
    if (lowerName.includes('thickness') || lowerName.includes('size')) {
        return validateRange(value, 1, 100, { paramName: parameterName, integerOnly: true });
    }

    // Count/times parameters
    if (lowerName.includes('times') || lowerName.includes('count')) {
        return validateRange(value, 0, 10000, { paramName: parameterName, integerOnly: true });
    }

    // Default: just validate it's a valid number if numeric
    const numResult = validateNumber(value);
    if (numResult.isValid) {
        return createValidResult();
    }

    // If not a number, assume it's valid (could be an expression)
    return createValidResult();
}

// -- Program Validation ---------------------------------------------------------------------------

/**
 * Validates a list of instructions.
 * @param instructions - Array of instruction objects with name and parameters.
 * @returns Program validation result.
 */
export function validateProgram(
    instructions: Array<{
        name: string;
        parameters: Record<string, unknown>;
        lineNumber?: number;
    }>,
): IProgramValidationResult {
    const invalidInstructions: IInstructionValidationResult[] = [];
    let errorCount = 0;

    for (const instruction of instructions) {
        const result = validateInstruction(
            instruction.name,
            instruction.parameters,
            instruction.lineNumber,
        );

        if (!result.isValid) {
            invalidInstructions.push(result);
            errorCount += result.state.errors.length;
        }
    }

    const isValid = invalidInstructions.length === 0;

    let summary: string;
    if (isValid) {
        summary = `✓ All ${instructions.length} instructions validated successfully.`;
    } else {
        summary = `✕ Found ${errorCount} validation error(s) in ${invalidInstructions.length} instruction(s).`;
    }

    return {
        isValid,
        invalidInstructions,
        errorCount,
        summary,
    };
}

// -- Error Formatting -----------------------------------------------------------------------------

/**
 * Formats validation errors for display in the editor.
 * @param result - The program validation result.
 * @returns Formatted error string for display.
 */
export function formatValidationErrors(result: IProgramValidationResult): string {
    if (result.isValid) {
        return '';
    }

    const lines: string[] = [result.summary, ''];

    for (const instruction of result.invalidInstructions) {
        lines.push(...instruction.formattedErrors);
    }

    return lines.join('\n');
}

/**
 * Creates a user-friendly validation error message.
 * @param parameterName - The name of the invalid parameter.
 * @param value - The invalid value.
 * @param result - The validation result.
 * @returns Formatted error message.
 */
export function createUserFriendlyError(
    parameterName: string,
    value: unknown,
    result: IValidationResult,
): string {
    const parts: string[] = [];

    // Main error message
    if (result.message) {
        parts.push(`❌ ${result.message}`);
    } else {
        parts.push(`❌ Invalid value for ${parameterName}: ${value}`);
    }

    // Suggestion
    if (result.suggestion !== undefined) {
        parts.push(`💡 Suggested value: ${result.suggestion}`);
    }

    // Details
    if (result.details) {
        parts.push(`ℹ️ ${result.details}`);
    }

    return parts.join('\n');
}
