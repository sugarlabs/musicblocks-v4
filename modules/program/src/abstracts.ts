import { TNodeType, TUnaryOperator, TBinaryOperator } from "./@types/index";

// Base AST node
export abstract class ASTNodeBase {
  constructor(protected readonly _type: TNodeType) {}
  public get type(): TNodeType {
    return this._type;
  }
}

// Program
export abstract class Program extends ASTNodeBase {
  constructor(public body: ASTNodeBase[]) {
    super("Program");
  }
}

// Function Declarations
export abstract class FunctionDeclaration extends ASTNodeBase {
  constructor(
    nodeType: TNodeType,
    public body: ASTNodeBase
  ) {
    super(nodeType);
  }
}

// Thread Function Declaration
export abstract class ThreadFunctionDeclaration extends FunctionDeclaration {
  constructor(public body: ASTNodeBase) {
    super("ThreadFunctionDeclaration", body);
  }
}

// Custom Function Declaration
export abstract class CustomFunctionDeclaration extends FunctionDeclaration {
  constructor(
    public id: IdentifierExpression,
    public params: IdentifierExpression[],
    body: ASTNodeBase
  ) {
    super("CustomFunctionDeclaration", body);
  }
}

// Block
export abstract class Block extends ASTNodeBase {
  constructor(public statements: ASTNodeBase[]) {
    super("Block");
  }
}

// Statements
export abstract class Statement extends ASTNodeBase {}

export abstract class SimpleStatement extends Statement {}

export abstract class CompoundStatement extends Statement {
  constructor(
    nodeType: TNodeType,
    public body: ASTNodeBase
  ) {
    super(nodeType);
  }
}

// Expressions
export abstract class Expression extends ASTNodeBase {}

export abstract class LiteralExpression extends Expression {
  constructor(
    nodeType: TNodeType,
    public value: number | string | boolean
  ) {
    super(nodeType);
  }
}

export class NumericLiteralExpression extends LiteralExpression {
  constructor(public value: number) {
    super("NumericLiteralExpression", value);
  }
}

export class StringLiteralExpression extends LiteralExpression {
  constructor(public value: string) {
    super("StringLiteralExpression", value);
  }
}

export class BooleanLiteralExpression extends LiteralExpression {
  constructor(public value: boolean) {
    super("BooleanLiteralExpression", value);
  }
}

export abstract class OperatorExpression extends Expression {
  constructor(nodeType: TNodeType) {
    super(nodeType);
  }
}

export abstract class UnaryOperatorExpression extends OperatorExpression {
  constructor(
    nodeType: TNodeType,
    public operator: TUnaryOperator,
    public operand: Expression
  ) {
    super(nodeType);
  }
}

export abstract class BinaryOperatorExpression extends OperatorExpression {
  constructor(
    nodeType: TNodeType,
    public operator: TBinaryOperator,
    public left: Expression,
    public right: Expression
  ) {
    super(nodeType);
  }
}

// Function Call
export abstract class FunctionCallExpression extends Expression {
  constructor(
    public callee: Expression,
    public args: { param: Expression; value: Expression }[]
  ) {
    super("FunctionCallExpression");
  }
}

// Member Expression
export abstract class MemberExpression extends Expression {
  constructor(
    public object: Expression,
    public property: Expression
  ) {
    super("MemberExpression");
  }
}

// Array Expression
export abstract class ArrayExpression extends Expression {
  constructor(public elements: Expression[]) {
    super("ArrayExpression");
  }
}

// Dict Expression
export abstract class DictExpression extends Expression {
  constructor(
    public entries: { key: Expression; value: Expression }[]
  ) {
    super("DictExpression");
  }
}

// Identifier Expression
export abstract class IdentifierExpression extends Expression {
  constructor(public name: string) {
    super("IdentifierExpression");
  }
}
