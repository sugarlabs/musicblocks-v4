import { ASTNodeBase, FunctionDeclaration } from "../../abstracts";

export class ThreadFunctionDeclaration extends FunctionDeclaration {
  constructor(body: ASTNodeBase) {
    super("ThreadFunctionDeclaration", body);
  }
}