import { SimpleStatement } from "../../abstracts";
import { IdentifierExpression } from "../expression/IdentifierExpression";
import { Expression } from "../../abstracts";

export class VariableDeclarationStatement extends SimpleStatement {
  constructor(
    public readonly id: IdentifierExpression,
    public readonly init: Expression
  ) {
    super("VariableDeclarationStatement");
  }
}