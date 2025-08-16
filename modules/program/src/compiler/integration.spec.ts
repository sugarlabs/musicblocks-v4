import { Compiler } from './compiler';
import { createMusicBlocksProgram2 } from '../examples/MusicBlocksProgram2';
import { SymDeclareInstruction } from '../../../runtime/src/interpreter/instructions/sym-declare-instruction';
import { SymAssignInstruction } from '../../../runtime/src/interpreter/instructions/sym-assign-instruction';
import { SymQueryInstruction } from '../../../runtime/src/interpreter/instructions/sym-query-instruction';
import { CallInstruction } from '../../../runtime/src/interpreter/instructions/call-instruction';
import { CompareJumpInstruction } from '../../../runtime/src/interpreter/instructions/compare-jump-instruction';
import { JumpInstruction } from '../../../runtime/src/interpreter/instructions/jump-instruction';

describe('Compiler Integration Tests', () => {
    let compiler: Compiler;

    beforeEach(() => {
        compiler = new Compiler();
    });

    it('should compile the full Music Blocks example program', () => {
        const program = createMusicBlocksProgram2();

        const irProgram = compiler.compile(program);

        expect(irProgram).toBeDefined();
        expect(irProgram.functions).toBeDefined();

        expect(irProgram.functions.size).toBeGreaterThan(0);

        console.log('Generated functions:', Array.from(irProgram.functions.keys()));

        for (const [name, func] of irProgram.functions) {
            expect(func.blocks).toBeDefined();
            expect(func.blocks.length).toBeGreaterThan(0);
            console.log(`Function ${name}: ${func.blocks.length} blocks`);

            for (const block of func.blocks) {
                console.log(`  Block ${block.label}: ${block.instructions.length} instructions`);
            }
        }
    });

    it('should generate complete IR with detailed instruction output', () => {
        const program = createMusicBlocksProgram2();

        const irProgram = compiler.compile(program);

        // Display complete IR generation output
        console.log('\n=== COMPLETE IR GENERATION OUTPUT ===');
        console.log(`Total functions generated: ${irProgram.functions.size}`);
        console.log(`Function names: [${Array.from(irProgram.functions.keys()).join(', ')}]`);

        let totalBlocks = 0;
        let totalInstructions = 0;

        // Iterate through each function and display detailed information
        for (const [functionName, irFunction] of irProgram.functions) {
            console.log(`\n--- Function: ${functionName} ---`);
            console.log(`Blocks count: ${irFunction.blocks.length}`);

            totalBlocks += irFunction.blocks.length;

            // Display each block and its instructions
            for (const block of irFunction.blocks) {
                console.log(`\n  Block: ${block.label}`);
                console.log(`    Instructions count: ${block.instructions.length}`);

                totalInstructions += block.instructions.length;

                // Display each instruction with details
                block.instructions.forEach((instruction, index) => {
                    const instrType = instruction.constructor.name;
                    let instrDetails = '';

                    // Add specific details based on instruction type
                    if (instruction instanceof SymDeclareInstruction) {
                        const symDeclareInstr = instruction as unknown as SymDeclareInstruction;
                        instrDetails = `variableName: ${(symDeclareInstr as unknown as { variableName: string }).variableName}`;
                    } else if (instruction instanceof SymAssignInstruction) {
                        const symAssignInstr = instruction as unknown as SymAssignInstruction;
                        instrDetails = `destinationVariable: ${(symAssignInstr as unknown as { destinationVariable: string }).destinationVariable}, source: ${JSON.stringify((symAssignInstr as unknown as { source: unknown }).source)}`;
                    } else if (instruction instanceof SymQueryInstruction) {
                        const symQueryInstr = instruction as unknown as SymQueryInstruction;
                        instrDetails = `variableName: ${(symQueryInstr as unknown as { variableName: string }).variableName}`;
                    } else if (instruction instanceof CallInstruction) {
                        const callInstr = instruction as unknown as CallInstruction;
                        instrDetails = `functionName: ${(callInstr as unknown as { functionName: string }).functionName}, parameters: ${(callInstr as unknown as { parameters?: unknown[] }).parameters?.length || 0} args`;
                    } else if (instruction instanceof CompareJumpInstruction) {
                        const compareJumpInstr = instruction as unknown as CompareJumpInstruction;
                        instrDetails = `condition: ${(compareJumpInstr as unknown as { condition: string }).condition}, targetLabel: ${(compareJumpInstr as unknown as { targetLabel: string }).targetLabel}`;
                    } else if (instruction instanceof JumpInstruction) {
                        const jumpInstr = instruction as unknown as JumpInstruction;
                        instrDetails = `targetLabel: ${(jumpInstr as unknown as { targetLabel: string }).targetLabel}`;
                    }

                    console.log(`      [${index}] ${instrType}: ${instrDetails}`);
                });
            }
        }

        console.log(`\n=== SUMMARY ===`);
        console.log(`Total functions: ${irProgram.functions.size}`);
        console.log(`Total blocks: ${totalBlocks}`);
        console.log(`Total instructions: ${totalInstructions}`);
        console.log('=== END IR GENERATION OUTPUT ===\n');

        // Verify the compilation was successful
        expect(irProgram.functions.size).toBeGreaterThan(0);
        expect(totalBlocks).toBeGreaterThan(0);
        expect(totalInstructions).toBeGreaterThan(0);
    });

    it('should show complete AST to IR compilation process', () => {
        // Get the example program
        const program = createMusicBlocksProgram2();

        console.log('\n=== AST TO IR COMPILATION PROCESS ===');
        console.log('Original AST Program Structure:');
        console.log(`- Program type: ${program.type}`);
        console.log(`- Program body length: ${program.body.length}`);

        // Show the structure of each function in the AST
        program.body.forEach((node, index) => {
            if (
                node.type === 'ThreadFunctionDeclaration' ||
                node.type === 'CustomFunctionDeclaration'
            ) {
                console.log(`\n  Function ${index + 1}: ${node.type}`);
                const functionName =
                    node.type === 'ThreadFunctionDeclaration'
                        ? 'main'
                        : (node as unknown as { id?: { name?: string } }).id?.name || 'unknown';
                console.log(`    Function name: ${functionName}`);

                const bodyStatements =
                    (node as unknown as { body: { body: unknown[] } }).body?.body || [];
                console.log(`    Body statements count: ${bodyStatements.length}`);

                bodyStatements.forEach((stmt, stmtIndex) => {
                    const stmtType = (stmt as { type: string }).type;
                    console.log(`      [${stmtIndex}] ${stmtType}`);
                });
            }
        });

        // Now compile and show the resulting IR
        console.log('\n--- COMPILING TO IR ---');
        const irProgram = compiler.compile(program);

        console.log(`\nCompilation Result:`);
        console.log(`- Generated ${irProgram.functions.size} IR functions`);

        for (const [functionName, irFunction] of irProgram.functions) {
            console.log(`\n  IR Function: ${functionName}`);
            console.log(`    Basic blocks: ${irFunction.blocks.length}`);
            console.log(
                `    Total instructions: ${irFunction.blocks.reduce((sum, block) => sum + block.instructions.length, 0)}`,
            );

            // Show control flow structure
            const blockTypes = irFunction.blocks.map((block) => {
                if (block.label.includes('loop')) return 'LOOP';
                if (block.label.includes('if') || block.label.includes('branch')) return 'BRANCH';
                if (block.label.includes('entry')) return 'ENTRY';
                return 'OTHER';
            });

            const structureCount = {
                ENTRY: blockTypes.filter((t) => t === 'ENTRY').length,
                LOOP: blockTypes.filter((t) => t === 'LOOP').length,
                BRANCH: blockTypes.filter((t) => t === 'BRANCH').length,
                OTHER: blockTypes.filter((t) => t === 'OTHER').length,
            };

            console.log(
                `    Control flow: Entry=${structureCount.ENTRY}, Loop=${structureCount.LOOP}, Branch=${structureCount.BRANCH}, Other=${structureCount.OTHER}`,
            );
        }

        console.log('\n=== END AST TO IR COMPILATION PROCESS ===\n');

        expect(irProgram.functions.size).toBeGreaterThan(0);
    });

    it('should generate comprehensive IR for complex control flow', () => {
        const program = createMusicBlocksProgram2();
        const irProgram = compiler.compile(program);

        // Verify we have all expected functions
        expect(irProgram.functions.has('start1')).toBe(true);
        expect(irProgram.functions.has('start2')).toBe(true);
        expect(irProgram.functions.has('action')).toBe(true);
        expect(irProgram.functions.has('action1')).toBe(true);
        expect(irProgram.functions.has('action2')).toBe(true);

        // Verify that we have complex control flow structures
        const start2Function = irProgram.functions.get('start2')!;

        // Should have multiple blocks due to loops and branches
        expect(start2Function.blocks.length).toBeGreaterThan(5);

        // Verify we have different types of blocks
        const blockLabels = start2Function.blocks.map((block) => block.label);
        const hasLoopBlocks = blockLabels.some((label) => label.includes('loop'));
        const hasControlBlocks = blockLabels.some(
            (label) => label.includes('condition') || label.includes('end'),
        );

        expect(hasLoopBlocks).toBe(true);
        expect(hasControlBlocks).toBe(true);

        // Verify that blocks have instructions
        const totalInstructions = start2Function.blocks.reduce(
            (sum, block) => sum + block.instructions.length,
            0,
        );
        expect(totalInstructions).toBeGreaterThan(10);
    });

    it('should demonstrate complete working example execution flow', () => {
        console.log('\n=== MUSIC BLOCKS V4 AST-TO-IR COMPILER DEMONSTRATION ===');

        const program = createMusicBlocksProgram2();
        const irProgram = compiler.compile(program);

        console.log('\nCOMPILATION SUMMARY:');
        console.log(
            `Compiled ${program.body.length} AST functions into ${irProgram.functions.size} IR functions`,
        );
        console.log(`Generated ${irProgram.functions.size} complete function implementations`);

        let totalBlocks = 0;
        let totalInstructions = 0;

        for (const [, irFunction] of irProgram.functions) {
            totalBlocks += irFunction.blocks.length;
            totalInstructions += irFunction.blocks.reduce(
                (sum, block) => sum + block.instructions.length,
                0,
            );
        }

        console.log(
            `Created ${totalBlocks} basic blocks with ${totalInstructions} IR instructions`,
        );

        console.log('\nGENERATED IR FUNCTIONS:');

        for (const [functionName, irFunction] of irProgram.functions) {
            console.log(`\n   Function: ${functionName}`);
            console.log(`   ├─ Blocks: ${irFunction.blocks.length}`);
            console.log(
                `   ├─ Instructions: ${irFunction.blocks.reduce((sum, block) => sum + block.instructions.length, 0)}`,
            );

            // Show control flow patterns
            const patterns = [];
            const blockLabels = irFunction.blocks.map((block) => block.label);

            if (blockLabels.some((label) => label.includes('loop'))) {
                patterns.push('Iteration Loops');
            }
            if (blockLabels.some((label) => label.includes('if') || label.includes('branch'))) {
                patterns.push('Conditional Branches');
            }
            if (blockLabels.some((label) => label.includes('entry'))) {
                patterns.push('Sequential Execution');
            }

            console.log(`   └─ Control Flow: ${patterns.join(', ')}`);
        }

        console.log('\nINSTRUCTION TYPES GENERATED:');
        const instructionTypes = new Set<string>();
        const instructionCounts: Record<string, number> = {};

        for (const [, irFunction] of irProgram.functions) {
            for (const block of irFunction.blocks) {
                for (const instruction of block.instructions) {
                    const type = instruction.constructor.name;
                    instructionTypes.add(type);
                    instructionCounts[type] = (instructionCounts[type] || 0) + 1;
                }
            }
        }

        Object.entries(instructionCounts).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} instructions`);
        });

        // Verify successful compilation
        expect(irProgram.functions.size).toBe(5);
        expect(totalBlocks).toBeGreaterThan(30);
        expect(totalInstructions).toBeGreaterThan(100);
        expect(instructionTypes.size).toBeGreaterThan(4);
    });
});
