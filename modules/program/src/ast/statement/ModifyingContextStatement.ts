import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";

export class ModifyingContextStatement extends CompoundStatement {
  constructor(
    public readonly args: { param: Expression; value: Expression }[],
    body: ASTNodeBase
  ) {
    super("ModifyingContextStatement", body);
  }
}