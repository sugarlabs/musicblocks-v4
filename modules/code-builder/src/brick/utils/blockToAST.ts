/**
 * blockToAST.ts
 * 
 * Utility functions for converting Project Builder's Brick data into
 * Music Blocks v4 abstract syntax tree nodes.
 */

export class ASTNode {
    name: string;
    category: 'data'|'expression'|'statement'|'block';
    value?: any;
    args: ASTNode[];
    children: ASTNode[];
    next?: ASTNode;
    
    constructor(name: string, category: 'data'|'expression'|'statement'|'block', value?: any) {
      this.name = name;
      this.category = category;
      this.value = value;
      this.args = [];
      this.children = [];
    }
  }
  
  export interface Brick {
    id: string;
    type: 'data'|'expression'|'statement'|'block';
    kind: string;       // e.g. "Note", "Repeat", "Number", ...
    value?: any;
    children?: Brick[];
  }
  
  function convertBrickToAST(brick: Brick): ASTNode {
    const node = new ASTNode(brick.kind, brick.type, brick.value);
  
    if (brick.children && brick.children.length > 0) {
      if (brick.type === 'block') {
        // For clamp-like blocks (loops, conditionals, etc.):
        let prevStmtNode: ASTNode | undefined;
        for (const childBrick of brick.children) {
          if (childBrick.type === 'data' || childBrick.type === 'expression') {
            // argument to the block
            node.args.push(convertBrickToAST(childBrick));
          } else if (childBrick.type === 'statement' || childBrick.type === 'block') {
            // statement in the block's body
            const stmtNode = convertBrickToAST(childBrick);
            if (!prevStmtNode) {
              // first statement in body
              node.children.push(stmtNode);
            } else {
              // link previous statement
              prevStmtNode.next = stmtNode;
            }
            prevStmtNode = stmtNode;
          }
        }
      } else if (brick.type === 'statement' || brick.type === 'expression') {
        // For statements or expressions, children become arguments
        for (const childBrick of brick.children) {
          node.args.push(convertBrickToAST(childBrick));
        }
      }
    }
  
    return node;
  }
  
  /**
   * Builds an array of AST root nodes from an array of top-level bricks.
   * Each top-level brick is typically a 'block' or 'statement' that might
   * represent an independent process in Music Blocks.
   */
  export function buildASTFromBricks(topBricks: Brick[]): ASTNode[] {
    const astRoots: ASTNode[] = [];
  
    for (const topBrick of topBricks) {
      const astNode = convertBrickToAST(topBrick);
      // Optionally wrap each top-level node in a 'Process' AST node if
      // the MB engine expects parallel processes.
      const processNode = new ASTNode('Process', 'block');
      processNode.children.push(astNode);
      astRoots.push(processNode);
    }
  
    return astRoots;
  }
  