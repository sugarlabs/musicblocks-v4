/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProgramDeclaration } from '../ast/ProgramDeclaration';
import { ThreadFunctionDeclaration } from '../ast/function/ThreadFunctionDeclaration';
import { CustomFunctionDeclaration } from '../ast/function/CustomFunctionDeclaration';
import { Block } from '../ast/Block';
import { IterationLoopStatement } from '../ast/statement/IterationLoopStatement';
import { BranchStatement } from '../ast/statement/BranchStatement';
import { VariableDeclarationStatement } from '../ast/statement/VariableDeclarationStatement';
import { NumericLiteralExpression } from '../ast/expression/NumericLiteralExpression';
import { StringLiteralExpression } from '../ast/expression/StringLiteralExpression';
import { BooleanLiteralExpression } from '../ast/expression/BooleanLiteralExpression';
import { IdentifierExpression } from '../ast/expression/IdentifierExpression';
import { FunctionCallStatement } from '../ast/statement/FunctionCallStatement';
import { ModifyingContextStatement } from '../ast/statement/ModifyingContextStatement';

import {
    PlayNoteStatement,
    SetKeyStatement,
    SetMasterVolumeStatement,
    ForwardStatement,
    RightStatement,
    LeftStatement,
    ClearStatement,
    OnNoteDoStatement,
    NoteExpression,
} from '../ast/music-blocks/MusicBlocksConstructs';

/**
 * Creates the correct AST representation:
 *
 * Program
 * Start (Thread function declaration)
 *   On note do (function call)
 * Start (Thread function declaration)
 *   Clear (function call)
 *   Box (Variable declaration statement)
 *   Box (Variable declaration statement)
 *   Set Key (function call statement)
 *   Set master vol (function call statement)
 *   Play Note (function call statement)
 *   Repeat (Iteration loop statement)
 *     Action (function call)
 *     Action1 (function call)
 *     Action2 (function call)
 * Action (custom function dec)
 *   Play Note (function call statement)
 *   Play Note (function call statement)
 * Action1
 *   Forward (function call statement)
 *   If Stmt (Branch Statement)
 *     Right (function call statement)
 *     Left (function call statement)
 * Action2
 *   Set instrument (Modifying context statement)
 *     Decresendo (Modifying context statement)
 *       Scalar step (function call)
 */
export function createMusicBlocksProgram2(): ProgramDeclaration {
    const program = new ProgramDeclaration([]);

    // Start thread function 1: On note do
    const start1Block = new Block([new OnNoteDoStatement(new IdentifierExpression('action'))]);

    // Start thread function 2: Main program logic
    const start2Block = new Block([
        new ClearStatement(),
        // Box (Variable declaration statement)
        new VariableDeclarationStatement(
            new IdentifierExpression('box1'),
            new NumericLiteralExpression(0),
        ),
        // Box (Variable declaration statement)
        new VariableDeclarationStatement(
            new IdentifierExpression('box2'),
            new NumericLiteralExpression(10),
        ),
        // Set Key (function call statement)
        new SetKeyStatement(new StringLiteralExpression('C major')),
        // Set master vol (function call statement)
        new SetMasterVolumeStatement(new NumericLiteralExpression(80)),
        // Play Note (function call statement)
        new PlayNoteStatement(new NoteExpression('C4'), new NumericLiteralExpression(0.25)),
        // Repeat (Iteration loop statement)
        new IterationLoopStatement(
            new IdentifierExpression('i'),
            new NumericLiteralExpression(3),
            new Block([
                // Action (function call)
                new FunctionCallStatement(new IdentifierExpression('action'), []),
                // Action1 (function call)
                new FunctionCallStatement(new IdentifierExpression('action1'), []),
                // Action2 (function call)
                new FunctionCallStatement(new IdentifierExpression('action2'), []),
            ]),
        ),
    ]);

    // Action (custom function dec)
    const actionBlock = new Block([
        // Play Note (function call statement)
        new PlayNoteStatement(new NoteExpression('D4'), new NumericLiteralExpression(0.25)),
        // Play Note (function call statement)
        new PlayNoteStatement(new NoteExpression('E4'), new NumericLiteralExpression(0.25)),
    ]);

    // Action1
    const action1Block = new Block([
        // Forward (function call statement)
        new ForwardStatement(new NumericLiteralExpression(50)),
        // If Stmt (Branch Statement)
        new BranchStatement([
            {
                test: new BooleanLiteralExpression(true),
                body: new Block([
                    // Right (function call statement)
                    new RightStatement(new NumericLiteralExpression(90)),
                ]),
            },
            {
                test: new BooleanLiteralExpression(false),
                body: new Block([
                    // Left (function call statement)
                    new LeftStatement(new NumericLiteralExpression(90)),
                ]),
            },
        ]),
    ]);

    // Action2
    const action2Block = new Block([
        // Set instrument (Modifying context statement)
        new ModifyingContextStatement(
            [
                {
                    param: new IdentifierExpression('instrument'),
                    value: new StringLiteralExpression('guitar'),
                },
            ],
            new Block([
                // Decresendo (Modifying context statement)
                new ModifyingContextStatement(
                    [
                        {
                            param: new IdentifierExpression('volume'),
                            value: new NumericLiteralExpression(5),
                        },
                    ],
                    new Block([
                        // Scalar step (function call)
                        new FunctionCallStatement(new IdentifierExpression('scalarStep'), [
                            {
                                param: new IdentifierExpression('value'),
                                value: new NumericLiteralExpression(1),
                            },
                        ]),
                    ]),
                ),
            ]),
        ),
    ]);

    // Create function declarations
    const start1 = new ThreadFunctionDeclaration(start1Block);
    const start2 = new ThreadFunctionDeclaration(start2Block);

    const action = new CustomFunctionDeclaration(
        new IdentifierExpression('action'),
        [],
        actionBlock,
    );

    const action1 = new CustomFunctionDeclaration(
        new IdentifierExpression('action1'),
        [],
        action1Block,
    );

    const action2 = new CustomFunctionDeclaration(
        new IdentifierExpression('action2'),
        [],
        action2Block,
    );

    // Build the complete program
    program.body.push(start1);
    program.body.push(start2);
    program.body.push(action);
    program.body.push(action1);
    program.body.push(action2);

    return program;
}
