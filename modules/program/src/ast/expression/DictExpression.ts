import { DictExpression as DictExpressionAbstract, Expression } from "../../abstracts";

export class DictExpression extends DictExpressionAbstract {
  constructor(entries: { key: Expression; value: Expression }[]) {
    super(entries);
  }
}