import { describe, it, expect } from 'vitest';
import { IRFunction } from './ir-function';
import { IRBasicBlock } from './ir-basic-block';

describe('IRFunction', () => {
    it('should be instantiated correctly with name and blocks', () => {
        const blocks: IRBasicBlock[] = [];
        const irFunction = new IRFunction('testFunction', blocks);

        expect(irFunction).toBeInstanceOf(IRFunction);
        expect(irFunction.name).toBe('testFunction');
        expect(irFunction.blocks).toBe(blocks);
        expect(irFunction.blocks.length).toBe(0);
    });

    it('should store blocks correctly', () => {
        const block1 = new IRBasicBlock('entry', []);
        const block2 = new IRBasicBlock('block2', []);
        const blocks = [block1, block2];

        const irFunction = new IRFunction('testFunction', blocks);

        expect(irFunction.blocks.length).toBe(2);
        expect(irFunction.blocks[0]).toBe(block1);
        expect(irFunction.blocks[1]).toBe(block2);
    });
});
