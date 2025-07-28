import { IRBasicBlock } from './ir-basic-block';

/**
 * IRFunction represents a single function containing ordered basic blocks.
 * The first block is always the entry point.
 */
export class IRFunction {
    constructor(
        public name: string,
        public blocks: IRBasicBlock[],
    ) {}
}
