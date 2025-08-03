import { IRFunction } from './ir-function';

/**
 * IRProgram represents a collection of functions that make up a complete program.
 */
export class IRProgram {
    constructor(public functions: Map<string, IRFunction>) {}
}
