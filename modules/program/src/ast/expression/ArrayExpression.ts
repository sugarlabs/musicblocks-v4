import { ArrayExpression as ArrayExpressionAbstract, Expression } from "../../abstracts";

export class ArrayExpression extends ArrayExpressionAbstract {
  constructor(elements: Expression[]) {
    super(elements);
  }
}