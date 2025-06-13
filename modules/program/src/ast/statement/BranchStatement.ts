import { CompoundStatement, Expression, ASTNodeBase } from "../../abstracts";

export class BranchStatement extends CompoundStatement {
  constructor(
    public readonly clauses: { test: Expression; body: ASTNodeBase }[]
  ) {
    super("BranchStatement", clauses[0]?.body || null as any);
  }

  public get firstClauseBody(): ASTNodeBase {
    return this.clauses[0]?.body || null as any;
  }
}