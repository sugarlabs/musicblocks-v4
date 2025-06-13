import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";

export class SequenceAlterStatement extends CompoundStatement {
  constructor(
    public readonly args: { param: Expression; value: Expression }[],
    body: ASTNodeBase
  ) {
    super("SequenceAlterStatement", body);
  }
}