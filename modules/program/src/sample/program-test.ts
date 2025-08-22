/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMusicBlocksProgram2 } from '../examples/MusicBlocksProgram2';

// Create and test the program
const program = createMusicBlocksProgram2();

console.log('Music Blocks Program AST:');
console.log(JSON.stringify(program, null, 2));

// Test type checking
console.log('\nProgram Structure:');
console.log(`Program has ${program.body.length} function declarations`);

program.body.forEach((decl, index) => {
    console.log(`Function ${index + 1}: ${decl.type}`);
    if (decl.type === 'CustomFunctionDeclaration') {
        const customDecl = decl as any;
        console.log(`  - Name: ${customDecl.id.name}`);
        console.log(`  - Parameters: ${customDecl.params.length}`);
    }
});

console.log('\n✅ Test completed successfully!');
