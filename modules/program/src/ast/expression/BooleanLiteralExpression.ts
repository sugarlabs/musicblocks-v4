import { LiteralExpression } from "../../abstracts";

export class BooleanLiteralExpression extends LiteralExpression {
  constructor(value: boolean) {
    super("BooleanLiteralExpression", value);
  }
}