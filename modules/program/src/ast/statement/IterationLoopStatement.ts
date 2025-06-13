import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";
import { IdentifierExpression } from "../expression/IdentifierExpression";

export class IterationLoopStatement extends CompoundStatement {
  constructor(
    public readonly value: IdentifierExpression,
    public readonly iterator: Expression,
    body: ASTNodeBase
  ) {
    super("IterationLoopStatement", body);
  }
}