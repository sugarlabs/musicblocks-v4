import { MemberExpression as MemberExpressionAbstract, Expression } from "../../abstracts";

export class MemberExpression extends MemberExpressionAbstract {
  constructor(object: Expression, property: Expression) {
    super(object, property);
  }
}