// == SYNTAX =======================================================================================

// -- elements -------------------------------------------------------------------------------------

export type { TData, TDataName } from './@types/data';

export { ElementData, ElementExpression } from './syntax/elements/elementArgument';
export { ElementStatement, ElementBlock } from './syntax/elements/elementInstruction';

// -- specification --------------------------------------------------------------------------------

export type { IElementSpecification, IElementSpecificationEntries } from './@types/specification';

export {
    registerElementSpecificationEntry,
    registerElementSpecificationEntries,
    removeElementSpecificationEntry,
    removeElementSpecificationEntries,
    queryElementSpecification,
    getElementClassifications,
    getElementNames,
    resetElementSpecificationTable,
    getSpecificationSnapshot,
    checkValueAssignment,
} from './syntax/specification';

// -- syntax tree ----------------------------------------------------------------------------------

export type { ITreeSnapshotInput } from './@types/syntaxTree';

export {
    getProcessNodes,
    getRoutineNodes,
    getCrumbs,
    getNode,
    generateSnapshot,
    generateFromSnapshot,
    resetSyntaxTree,
    assignNodeValue,
} from './syntax/tree';

// -- warehouse ------------------------------------------------------------------------------------

export {
    getInstance,
    getClassificationCount,
    getClassificationCountAll,
    getNameCount,
    getNameCountAll,
    getTypeCount,
    getTypeCountAll,
    getKindCount,
    getKindCountAll,
} from './syntax/warehouse';

// == EXECUTION ====================================================================================

export type { TPCOverride } from './@types/execution';

// -- scope ----------------------------------------------------------------------------------------

export type { IContext, ISymbolTable } from './@types/scope';

export { registerContext, deregisterContext, hasContext, ScopeStack } from './execution/scope';

// -- interpreter ----------------------------------------------------------------------------------

export {
    declareVariable,
    queryVariable,
    overrideProgramCounter,
    releaseProgramCounter,
    run,
} from './execution/interpreter';

// == LIBRARY ======================================================================================

// -- specification --------------------------------------------------------------------------------

export { default as librarySpecification } from './library';

// -- elements -------------------------------------------------------------------------------------

export {
    ElementValueBoolean,
    ElementValueNumber,
    ElementValueString,
} from './library/elements/elementValue';

export {
    ElementBoxGeneric,
    ElementBoxBoolean,
    ElementBoxNumber,
    ElementBoxString,
} from './library/elements/elementBox';

export {
    ElementBoxIdentifierGeneric,
    ElementBoxIdentifierBoolean,
    ElementBoxIdentifierNumber,
    ElementBoxIdentifierString,
} from './library/elements/elementBoxIdentifier';

export {
    ElementOperatorMathPlus,
    ElementOperatorMathMinus,
    ElementOperatorMathTimes,
    ElementOperatorMathDivide,
    ElementOperatorMathModulus,
} from './library/elements/elementOperatorMath';

export { ElementIf } from './library/elements/elementConditional';

export { ElementRepeat } from './library/elements/elementLoop';

export { ElementPrint } from './library/elements/elementPrint';

export { ElementProcess, ElementRoutine } from './library/elements/elementProgram';
