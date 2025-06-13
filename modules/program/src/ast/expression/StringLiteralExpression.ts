import { LiteralExpression } from "../../abstracts";

export class StringLiteralExpression extends LiteralExpression {
  constructor(value: string) {
    super("StringLiteralExpression", value);
  }
}