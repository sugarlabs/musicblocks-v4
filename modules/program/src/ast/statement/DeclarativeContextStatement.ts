import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";

export class DeclarativeContextStatement extends CompoundStatement {
  constructor(
    public readonly args: { param: Expression; value: Expression }[],
    body: ASTNodeBase
  ) {
    super("DeclarativeContextStatement", body);
  }
}