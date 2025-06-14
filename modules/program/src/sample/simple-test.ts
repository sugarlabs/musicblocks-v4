import { NumericLiteralExpression } from '../ast/expression/NumericLiteralExpression';
import { StringLiteralExpression } from '../ast/expression/StringLiteralExpression';
import { IdentifierExpression } from '../ast/expression/IdentifierExpression';
import { ProgramDeclaration } from '../ast/ProgramDeclaration';

console.log('🧪 Running simple AST tests...\n');

// Test 1: Create basic expressions
console.log('Test 1: Creating basic expressions');
const num = new NumericLiteralExpression(42);
const str = new StringLiteralExpression('hello');
const id = new IdentifierExpression('myVariable');

console.log(`✓ Number: ${num.value} (type: ${num.type})`);
console.log(`✓ String: ${str.value} (type: ${str.type})`);
console.log(`✓ Identifier: ${id.name} (type: ${id.type})`);

// Test 2: Create empty program
console.log('\nTest 2: Creating empty program');
const program = new ProgramDeclaration([]);
console.log(`✓ Program created with ${program.body.length} functions (type: ${program.type})`);

console.log('\n✅ All simple tests passed!');
