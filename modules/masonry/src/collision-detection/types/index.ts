import WorkspaceManager from '../../workspace/model/model';
import { createExpressionCollisionMap } from './ExpressionMap';
import { createStatementCollisionMap } from './StatementMap';
import type { Rect } from './Types';

const workspaceManager = new WorkspaceManager();

const canvasBounds: Rect = { x: 0, y: 0, w: 2000, h: 2000 };

export const expressionMap = createExpressionCollisionMap(workspaceManager, canvasBounds);
export const statementMap = createStatementCollisionMap(workspaceManager, canvasBounds);
