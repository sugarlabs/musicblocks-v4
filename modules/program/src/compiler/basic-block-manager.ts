import { IRBasicBlock } from '../../../runtime/src/interpreter/ir-basic-block';

export class BasicBlockManager {
    private blocks: Map<string, IRBasicBlock> = new Map();
    private blockCounter = 0;

    public createBlock(prefix: string): IRBasicBlock {
        const label = `${prefix}_${this.blockCounter++}`;
        const block = new IRBasicBlock(label, []);
        this.blocks.set(label, block);
        return block;
    }

    public getBlock(label: string): IRBasicBlock | undefined {
        return this.blocks.get(label);
    }

    public getAllBlocks(): IRBasicBlock[] {
        return Array.from(this.blocks.values());
    }
}
