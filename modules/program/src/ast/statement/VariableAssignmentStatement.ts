import { SimpleStatement } from "../../abstracts";
import { IdentifierExpression } from "../expression/IdentifierExpression";
import { Expression } from "../../abstracts";

export class VariableAssignmentStatement extends SimpleStatement {
  constructor(
    public readonly operator: string[],
    public readonly id: IdentifierExpression,
    public readonly init: Expression
  ) {
    super("VariableAssignmentStatement");
  }
}