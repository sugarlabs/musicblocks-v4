import { SimpleStatement } from "../../abstracts";
import { IdentifierExpression } from "../expression/IdentifierExpression";
import { Expression } from "../../abstracts";

export class FunctionCallStatement extends SimpleStatement {
  constructor(
    public readonly callee: IdentifierExpression,
    public readonly args: { param: IdentifierExpression; value: Expression }[]
  ) {
    super("FunctionCallStatement");
  }
}