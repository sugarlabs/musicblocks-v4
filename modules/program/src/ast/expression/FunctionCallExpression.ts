import { FunctionCallExpression as FunctionCallExpressionAbstract, Expression } from "../../abstracts";

export class FunctionCallExpression extends FunctionCallExpressionAbstract {
  constructor(
    callee: Expression,
    args: { param: Expression; value: Expression }[]
  ) {
    super(callee, args);
  }
}