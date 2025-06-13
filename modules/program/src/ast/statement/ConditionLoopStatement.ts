import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";

export class ConditionLoopStatement extends CompoundStatement {
  constructor(
    public readonly test: Expression,
    body: ASTNodeBase
  ) {
    super("ConditionLoopStatement", body);
  }
}