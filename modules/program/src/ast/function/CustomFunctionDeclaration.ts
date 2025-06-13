import { ASTNodeBase, FunctionDeclaration } from "../../abstracts";
import { IdentifierExpression } from "../expression/IdentifierExpression";

export class CustomFunctionDeclaration extends FunctionDeclaration {
  constructor(
    public readonly id: IdentifierExpression,
    public readonly params: IdentifierExpression[],
    body: ASTNodeBase
  ) {
    super("CustomFunctionDeclaration", body);
  }
}