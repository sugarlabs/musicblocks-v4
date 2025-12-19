export {
    // Core validation functions
    validate,
    validateParameter,
    validateBlock,

    // Range validators
    validateRange,
    validateTempo,
    validatePitch,
    validateVolume,
    validateOctave,

    // Format validators
    validateNoteName,
    validateDuration,
    validateNoteWithOctave,

    // Type validators
    validateType,
    validateNumber,
    validateString,
    validateBoolean,

    // Enum validators
    validateEnum,

    // Utility functions
    createValidationResult,
    createValidResult,
    createInvalidResult,
    clampToRange,
    parseNote,
} from './src';

export {
    // Pre-defined schemas
    TEMPO_SCHEMA,
    PITCH_SCHEMA,
    VOLUME_SCHEMA,
    OCTAVE_SCHEMA,
    NOTE_NAME_SCHEMA,
    DURATION_SCHEMA,
    NOTE_WITH_OCTAVE_SCHEMA,
} from './src/schemas';

export { useValidation } from './src/useValidation';
