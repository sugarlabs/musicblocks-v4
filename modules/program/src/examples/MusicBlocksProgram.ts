// Complete Music Blocks program example
import { ProgramDeclaration } from "../ast/ProgramDeclaration";
import { ThreadFunctionDeclaration } from "../ast/function/ThreadFunctionDeclaration";
import { CustomFunctionDeclaration } from "../ast/function/CustomFunctionDeclaration";
import { Block } from "../ast/Block";
import { IterationLoopStatement } from "../ast/statement/IterationLoopStatement";
import { BranchStatement } from "../ast/statement/BranchStatement";
import { VariableAssignmentStatement } from "../ast/statement/VariableAssignmentStatement";
import { NumericLiteralExpression } from "../ast/expression/NumericLiteralExpression";
import { StringLiteralExpression } from "../ast/expression/StringLiteralExpression";
import { BooleanLiteralExpression } from "../ast/expression/BooleanLiteralExpression";
import { IdentifierExpression } from "../ast/expression/IdentifierExpression";
import { BinaryOperatorExpression } from "../ast/expression/BinaryOperatorExpression";
import { FunctionCallStatement } from "../ast/statement/FunctionCallStatement";

import {
  PlayNoteStatement,
  SetKeyStatement,
  SetMasterVolumeStatement,
  ForwardStatement,
  RightStatement,
  LeftStatement,
  ClearStatement,
  BoxDeclarationStatement,
  SetInstrumentStatement,
  DecrescendoStatement,
  OnNoteDoStatement,
  InstrumentExpression,
  NoteExpression
} from "../ast/music-blocks/MusicBlocksConstructs";

// Create the main program
export function createMusicBlocksProgram(): ProgramDeclaration {
  const program = new ProgramDeclaration([]);

  // Create Start thread function 1
  const start1Block = new Block([
    new OnNoteDoStatement(new IdentifierExpression("action1")),
  ]);

  // Create Start thread function 2  
  const start2Block = new Block([
    new ClearStatement(),
    new BoxDeclarationStatement("box1", new NumericLiteralExpression(0)),
    new BoxDeclarationStatement("box2", new NumericLiteralExpression(10)),
    new SetKeyStatement(new StringLiteralExpression("C major")),
    new SetMasterVolumeStatement(new NumericLiteralExpression(80)),
    new PlayNoteStatement(
      new NoteExpression("C4"),
      new NumericLiteralExpression(0.25)
    ),
    new IterationLoopStatement(
      new IdentifierExpression("i"),
      new NumericLiteralExpression(3),
      new Block([
        new FunctionCallStatement(new IdentifierExpression("action1"), []),
        new FunctionCallStatement(new IdentifierExpression("action2"), []),
        new VariableAssignmentStatement(
          ["="], // operators
          new IdentifierExpression("box1"),
          new BinaryOperatorExpression(
            "add",
            new IdentifierExpression("box1"),
            new NumericLiteralExpression(1)
          )
        )
      ])
    )
  ]);

  // Create Action 1 custom function
  const action1Block = new Block([
    new PlayNoteStatement(
      new NoteExpression("D4"),
      new NumericLiteralExpression(0.25)
    ),
    new PlayNoteStatement(
      new NoteExpression("E4"),
      new NumericLiteralExpression(0.25)
    )
  ]);

  // Create Action 2 custom function
  const action2Block = new Block([
    new ForwardStatement(new NumericLiteralExpression(50)),
    new BranchStatement([
      {
        test: new BinaryOperatorExpression(
          "greaterThan",
          new IdentifierExpression("box1"),
          new NumericLiteralExpression(5)
        ),
        body: new Block([
          new RightStatement(new NumericLiteralExpression(90))
        ])
      },
      {
        test: new BooleanLiteralExpression(true),
        body: new Block([
          new LeftStatement(new NumericLiteralExpression(90))
        ])
      }
    ])
  ]);

  // Create Action 3 custom function
  const action3Block = new Block([
    new SetInstrumentStatement(
      new InstrumentExpression("guitar"),
      new Block([
        new DecrescendoStatement(
          new NumericLiteralExpression(5),
          new Block([
            new FunctionCallStatement(
              new IdentifierExpression("scalarStep"),
              [
                {
                  param: new IdentifierExpression("value"),
                  value: new NumericLiteralExpression(1)
                }
              ]
            )
          ])
        )
      ])
    )
  ]);

  // Create function declarations
  const start1 = new ThreadFunctionDeclaration(start1Block);
  const start2 = new ThreadFunctionDeclaration(start2Block);

  const action1 = new CustomFunctionDeclaration(
    new IdentifierExpression("action1"),
    [], // no parameters
    action1Block
  );

  const action2 = new CustomFunctionDeclaration(
    new IdentifierExpression("action2"),
    [], // no parameters  
    action2Block
  );

  const action3 = new CustomFunctionDeclaration(
    new IdentifierExpression("action3"),
    [], // no parameters
    action3Block
  );

  // Build the complete program
  program.body.push(start1);
  program.body.push(start2);
  program.body.push(action1);
  program.body.push(action2);
  program.body.push(action3);

  return program;
}


export function astToJSON(node: any): any {
  const result: any = {
    type: node.constructor.name
  };

  // Add relevant properties based on node type
  if (node.body) {
    if (Array.isArray(node.body)) {
      result.body = node.body.map((child: any) => astToJSON(child));
    } else {
      result.body = astToJSON(node.body);
    }
  }

  if (node.statements) {
    result.statements = node.statements.map((child: any) => astToJSON(child));
  }

  if (node.value !== undefined) {
    result.value = node.value;
  }

  if (node.name) {
    result.name = node.name;
  }

  if (node.args) {
    result.args = node.args.map((arg: any) => ({
      param: astToJSON(arg.param),
      value: astToJSON(arg.value)
    }));
  }

  if (node.clauses) {
    result.clauses = node.clauses.map((clause: any) => ({
      test: astToJSON(clause.test),
      body: astToJSON(clause.body)
    }));
  }

  return result;
}