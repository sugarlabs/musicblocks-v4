// Main runtime exports
export { Scheduler } from './scheduler/scheduler';
export type {
    ExecutionStatus as SchedulerExecutionStatus,
    ExternalFunction,
} from './scheduler/scheduler';

export { IRInterpreter } from './interpreter/interpreter';
export type { ExecutionStatus as InterpreterExecutionStatus } from './interpreter/interpreter';

export { ThreadControlBlock } from './scheduler/thread-control-block';
export { ExecutionContext } from './interpreter/execution-context';
export { IRProgram } from './interpreter/ir-program';
export { IRFunction } from './interpreter/ir-function';
export { IRBasicBlock } from './interpreter/ir-basic-block';

// Scheduler adapter for external function integration
export { SchedulerAdapter } from './scheduler-adapter';
export type { SchedulerStatus } from './scheduler-adapter';

// External function registry exports
export { GenericPluginAdapter, MockFunctionRegistry } from './execution/external-function-registry';
export type {
    IExternalFunctionRegistry,
    IGenericPluginManager,
} from './execution/external-function-registry';

// Re-export core instruction types
export { IRInstruction } from './interpreter/instructions/ir-instruction';
export { CallInstruction } from './interpreter/instructions/call-instruction';
export { JumpInstruction } from './interpreter/instructions/jump-instruction';
export { CompareJumpInstruction } from './interpreter/instructions/compare-jump-instruction';
export { SymDeclareInstruction } from './interpreter/instructions/sym-declare-instruction';
export { SymAssignInstruction } from './interpreter/instructions/sym-assign-instruction';
export { SymQueryInstruction } from './interpreter/instructions/sym-query-instruction';
