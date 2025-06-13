import { UnaryOperatorExpression as UnaryOperatorExpressionAbstract, Expression } from "../../abstracts";
import { TUnaryOperator } from "../../@types/index";

export class UnaryOperatorExpression extends UnaryOperatorExpressionAbstract {
  constructor(operator: TUnaryOperator, operand: Expression) {
    super("UnaryOperatorExpression", operator, operand);
  }
}