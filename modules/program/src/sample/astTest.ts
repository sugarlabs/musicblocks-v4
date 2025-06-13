import { ProgramDeclaration } from "../ast/ProgramDeclaration";
import { ThreadFunctionDeclaration } from "../ast/function/ThreadFunctionDeclaration";
import { Block } from "../ast/Block";
import { VariableDeclarationStatement } from "../ast/statement/VariableDeclarationStatement";
import { IdentifierExpression } from "../ast/expression/IdentifierExpression";
import { NumericLiteralExpression } from "../ast/expression/NumericLiteralExpression";

function dump(node: any, indent = 0) {
  const pad = " ".repeat(indent);
  console.log(`${pad}${node.type}`);
  if ("body" in node && Array.isArray(node.body)) {
    node.body.forEach((child: any) => dump(child, indent + 2));
  } else if ("statements" in node) {
    node.statements.forEach((child: any) => dump(child, indent + 2));
  } else if ("body" in node && node.body) {
    dump(node.body, indent + 2);
  }
}

// Build a tiny AST:
// Program
// └─ ThreadFunctionDeclaration
//    └─ Block
//       └─ VariableDeclarationStatement
//          ├─ IdentifierExpression (id: "x")
//          └─ NumericLiteralExpression (init: 42)

// print a tree as example (json format)
const ast = new ProgramDeclaration([
  new ThreadFunctionDeclaration(
    new Block([
      new VariableDeclarationStatement(
        new IdentifierExpression("x"),
        new NumericLiteralExpression(42),
      ),
    ]),
  ),
]);

dump(ast);
