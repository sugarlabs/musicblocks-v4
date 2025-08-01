import { BasicBlockManager } from './basic-block-manager';
import { SymDeclareInstruction } from '../../../runtime/src/interpreter/instructions/sym-declare-instruction';
import { SymAssignInstruction } from '../../../runtime/src/interpreter/instructions/sym-assign-instruction';
import { CallInstruction } from '../../../runtime/src/interpreter/instructions/call-instruction';
import { JumpInstruction } from '../../../runtime/src/interpreter/instructions/jump-instruction';
import { CompareJumpInstruction } from '../../../runtime/src/interpreter/instructions/compare-jump-instruction';

describe('BasicBlockManager', () => {
    let manager: BasicBlockManager;

    beforeEach(() => {
        manager = new BasicBlockManager();
    });

    it('should be defined', () => {
        expect(manager).toBeDefined();
    });

    it('should create basic blocks with unique labels', () => {
        const block1 = manager.createBlock('entry');
        const block2 = manager.createBlock('loop');
        const block3 = manager.createBlock('exit');

        expect(block1.label).toBe('entry_0');
        expect(block2.label).toBe('loop_1');
        expect(block3.label).toBe('exit_2');
    });

    it('should generate incremental labels for same prefix', () => {
        const block1 = manager.createBlock('entry');
        const block2 = manager.createBlock('entry');
        const block3 = manager.createBlock('entry');

        expect(block1.label).toBe('entry_0');
        expect(block2.label).toBe('entry_1');
        expect(block3.label).toBe('entry_2');
    });

    it('should track all created blocks', () => {
        const entryBlock = manager.createBlock('entry');
        const loopBlock = manager.createBlock('loop');
        const exitBlock = manager.createBlock('exit');

        const allBlocks = manager.getAllBlocks();
        expect(allBlocks).toHaveLength(3);
        expect(allBlocks).toContain(entryBlock);
        expect(allBlocks).toContain(loopBlock);
        expect(allBlocks).toContain(exitBlock);
    });

    it('should retrieve blocks by label', () => {
        const entryBlock = manager.createBlock('entry');
        const loopBlock = manager.createBlock('loop');

        expect(manager.getBlock('entry_0')).toBe(entryBlock);
        expect(manager.getBlock('loop_1')).toBe(loopBlock);
        expect(manager.getBlock('nonexistent_2')).toBeUndefined();
    });

    it('should support adding instructions to blocks', () => {
        const block = manager.createBlock('test');

        const declareInstruction = new SymDeclareInstruction('x');
        const assignInstruction = new SymAssignInstruction('x', 42);

        block.instructions.push(declareInstruction);
        block.instructions.push(assignInstruction);

        expect(block.instructions).toHaveLength(2);
        expect(block.instructions[0]).toBe(declareInstruction);
        expect(block.instructions[1]).toBe(assignInstruction);
    });

    it('should handle control flow with jump instructions', () => {
        const entryBlock = manager.createBlock('entry');
        const loopBlock = manager.createBlock('loop');
        const exitBlock = manager.createBlock('exit');

        // Entry block: declare variable and jump to loop
        entryBlock.instructions.push(new SymDeclareInstruction('i'));
        entryBlock.instructions.push(new SymAssignInstruction('i', 0));
        entryBlock.instructions.push(new JumpInstruction(loopBlock.label));

        // Loop block: do something and conditional jump
        loopBlock.instructions.push(new CallInstruction('doSomething', []));
        loopBlock.instructions.push(
            new CompareJumpInstruction('lessThan', 'i', 10, exitBlock.label, loopBlock.label),
        );

        // Exit block: finish
        exitBlock.instructions.push(new CallInstruction('finish', []));

        expect(entryBlock.instructions).toHaveLength(3);
        expect(loopBlock.instructions).toHaveLength(2);
        expect(exitBlock.instructions).toHaveLength(1);

        // Verify instruction types
        expect(entryBlock.instructions[0]).toBeInstanceOf(SymDeclareInstruction);
        expect(entryBlock.instructions[1]).toBeInstanceOf(SymAssignInstruction);
        expect(entryBlock.instructions[2]).toBeInstanceOf(JumpInstruction);
        expect(loopBlock.instructions[0]).toBeInstanceOf(CallInstruction);
        expect(loopBlock.instructions[1]).toBeInstanceOf(CompareJumpInstruction);
    });

    it('should support complex control flow patterns', () => {
        // Test nested loops and conditional branches
        const entryBlock = manager.createBlock('entry');
        const outerLoopInit = manager.createBlock('outer_loop_init');
        const outerLoopCondition = manager.createBlock('outer_loop_condition');
        const innerLoopInit = manager.createBlock('inner_loop_init');
        const innerLoopCondition = manager.createBlock('inner_loop_condition');
        const innerLoopBody = manager.createBlock('inner_loop_body');
        const innerLoopIncrement = manager.createBlock('inner_loop_increment');
        const outerLoopIncrement = manager.createBlock('outer_loop_increment');
        const exitBlock = manager.createBlock('exit');

        // Entry block
        entryBlock.instructions.push(new SymDeclareInstruction('outerVar'));
        entryBlock.instructions.push(new JumpInstruction(outerLoopInit.label));

        // Outer loop initialization
        outerLoopInit.instructions.push(new SymAssignInstruction('outerVar', 0));
        outerLoopInit.instructions.push(new JumpInstruction(outerLoopCondition.label));

        // Outer loop condition
        outerLoopCondition.instructions.push(
            new CompareJumpInstruction(
                'lessThan',
                'outerVar',
                3,
                innerLoopInit.label,
                exitBlock.label,
            ),
        );

        // Inner loop initialization
        innerLoopInit.instructions.push(new SymDeclareInstruction('innerVar'));
        innerLoopInit.instructions.push(new SymAssignInstruction('innerVar', 0));
        innerLoopInit.instructions.push(new JumpInstruction(innerLoopCondition.label));

        // Inner loop condition
        innerLoopCondition.instructions.push(
            new CompareJumpInstruction(
                'lessThan',
                'innerVar',
                5,
                innerLoopBody.label,
                outerLoopIncrement.label,
            ),
        );

        // Inner loop body
        innerLoopBody.instructions.push(new CallInstruction('processItem', []));
        innerLoopBody.instructions.push(new JumpInstruction(innerLoopIncrement.label));

        // Inner loop increment
        innerLoopIncrement.instructions.push(
            new SymAssignInstruction('innerVar', { op: 'add', left: 'innerVar', right: 1 }),
        );
        innerLoopIncrement.instructions.push(new JumpInstruction(innerLoopCondition.label));

        // Outer loop increment
        outerLoopIncrement.instructions.push(
            new SymAssignInstruction('outerVar', { op: 'add', left: 'outerVar', right: 1 }),
        );
        outerLoopIncrement.instructions.push(new JumpInstruction(outerLoopCondition.label));

        // Exit block
        exitBlock.instructions.push(new CallInstruction('cleanup', []));

        const allBlocks = manager.getAllBlocks();
        expect(allBlocks).toHaveLength(9);

        // Verify each block has the expected number of instructions
        expect(entryBlock.instructions).toHaveLength(2);
        expect(outerLoopInit.instructions).toHaveLength(2);
        expect(outerLoopCondition.instructions).toHaveLength(1);
        expect(innerLoopInit.instructions).toHaveLength(3);
        expect(innerLoopCondition.instructions).toHaveLength(1);
        expect(innerLoopBody.instructions).toHaveLength(2);
        expect(innerLoopIncrement.instructions).toHaveLength(2);
        expect(outerLoopIncrement.instructions).toHaveLength(2);
        expect(exitBlock.instructions).toHaveLength(1);
    });

    it('should create blocks for Music Blocks specific patterns', () => {
        // Test Music Blocks specific control flow patterns
        const startBlock = manager.createBlock('start');
        const noteSetupBlock = manager.createBlock('note_setup');
        const instrumentContextBlock = manager.createBlock('instrument_context');
        const playBlock = manager.createBlock('play');
        const volumeContextBlock = manager.createBlock('volume_context');
        const endBlock = manager.createBlock('end');

        // Start block
        startBlock.instructions.push(new CallInstruction('clear', []));
        startBlock.instructions.push(new JumpInstruction(noteSetupBlock.label));

        // Note setup block
        noteSetupBlock.instructions.push(new CallInstruction('setKey', ['C major']));
        noteSetupBlock.instructions.push(new CallInstruction('setMasterVolume', [80]));
        noteSetupBlock.instructions.push(new JumpInstruction(instrumentContextBlock.label));

        // Instrument context block
        instrumentContextBlock.instructions.push(
            new CallInstruction('setContext_instrument', ['guitar']),
        );
        instrumentContextBlock.instructions.push(new JumpInstruction(playBlock.label));

        // Play block
        playBlock.instructions.push(new CallInstruction('playNote', ['C4', 0.25]));
        playBlock.instructions.push(new JumpInstruction(volumeContextBlock.label));

        // Volume context block
        volumeContextBlock.instructions.push(new CallInstruction('setContext_volume', [5]));
        volumeContextBlock.instructions.push(new CallInstruction('scalarStep', [1]));
        volumeContextBlock.instructions.push(new CallInstruction('resetContext_volume', []));
        volumeContextBlock.instructions.push(new CallInstruction('resetContext_instrument', []));
        volumeContextBlock.instructions.push(new JumpInstruction(endBlock.label));

        // End block
        endBlock.instructions.push(new CallInstruction('finish', []));

        const allBlocks = manager.getAllBlocks();
        expect(allBlocks).toHaveLength(6);

        // Verify Music Blocks pattern structure
        expect(startBlock.instructions).toHaveLength(2);
        expect(noteSetupBlock.instructions).toHaveLength(3);
        expect(instrumentContextBlock.instructions).toHaveLength(2);
        expect(playBlock.instructions).toHaveLength(2);
        expect(volumeContextBlock.instructions).toHaveLength(5);
        expect(endBlock.instructions).toHaveLength(1);

        // Verify block labels
        expect(startBlock.label).toBe('start_0');
        expect(noteSetupBlock.label).toBe('note_setup_1');
        expect(instrumentContextBlock.label).toBe('instrument_context_2');
        expect(playBlock.label).toBe('play_3');
        expect(volumeContextBlock.label).toBe('volume_context_4');
        expect(endBlock.label).toBe('end_5');
    });

    it('should maintain block order in creation sequence', () => {
        const blocks = [];
        const blockNames = ['entry', 'init', 'loop', 'condition', 'body', 'increment', 'exit'];

        // Create blocks in sequence
        for (const name of blockNames) {
            blocks.push(manager.createBlock(name));
        }

        const allBlocks = manager.getAllBlocks();
        expect(allBlocks).toHaveLength(blockNames.length);

        // Verify blocks are created in order
        for (let i = 0; i < blocks.length; i++) {
            expect(blocks[i].label).toBe(`${blockNames[i]}_${i}`);
            expect(allBlocks).toContain(blocks[i]);
        }
    });

    it('should support creating multiple managers independently', () => {
        const manager1 = new BasicBlockManager();
        const manager2 = new BasicBlockManager();

        manager1.createBlock('function1_entry');
        manager1.createBlock('function1_loop');

        manager2.createBlock('function2_entry');
        manager2.createBlock('function2_condition');

        expect(manager1.getAllBlocks()).toHaveLength(2);
        expect(manager2.getAllBlocks()).toHaveLength(2);

        // Verify that the managers have different blocks (different actual labels)
        const manager1Labels = manager1.getAllBlocks().map((block) => block.label);
        const manager2Labels = manager2.getAllBlocks().map((block) => block.label);

        // Check that each manager has the expected pattern (with possible suffixes)
        expect(manager1Labels.some((label) => label.startsWith('function1_entry'))).toBe(true);
        expect(manager1Labels.some((label) => label.startsWith('function1_loop'))).toBe(true);
        expect(manager2Labels.some((label) => label.startsWith('function2_entry'))).toBe(true);
        expect(manager2Labels.some((label) => label.startsWith('function2_condition'))).toBe(true);

        // Verify they don't share any identical labels
        const sharedLabels = manager1Labels.filter((label) => manager2Labels.includes(label));
        expect(sharedLabels).toHaveLength(0);
    });
});
