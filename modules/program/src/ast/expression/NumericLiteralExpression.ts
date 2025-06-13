import { LiteralExpression } from "../../abstracts";

export class NumericLiteralExpression extends LiteralExpression {
  constructor(value: number) {
    super("NumericLiteralExpression", value);
  }
}