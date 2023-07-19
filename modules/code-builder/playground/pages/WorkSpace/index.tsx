import {
  BrickBlock,
  BrickData,
  BrickExpression,
  BrickStatement,
  ModelBrickBlock,
  ModelBrickData,
  ModelBrickExpression,
  ModelBrickStatement,
} from '@/brick';
import { WORKSPACES_DATA } from './data';
import type { TBrickCoords, TBrickType } from '@/@types/brick';
import type { Brick } from './data';

function getBrick(
  type: TBrickType,
  instance: ModelBrickBlock | ModelBrickData | ModelBrickExpression | ModelBrickStatement,
  coords: TBrickCoords,
) {
  switch (type) {
    case 'data':
      return <BrickData instance={instance as ModelBrickData} coords={coords} />;
    case 'expression':
      return <BrickExpression instance={instance as ModelBrickExpression} coords={coords} />;
    case 'statement':
      return <BrickStatement instance={instance as ModelBrickStatement} coords={coords} />;
    case 'block':
      return <BrickBlock instance={instance as ModelBrickBlock} coords={coords} />;
    default:
      return <></>;
  }
}

function RenderBricks({ brickData }: { brickData: Brick }) {
  return (
    <>
      {getBrick(brickData.type, brickData.instance, brickData.coords)}
      {brickData.children &&
        brickData.children?.length > 0 &&
        brickData.children.map((child) => <RenderBricks key={child.id} brickData={child} />)}
    </>
  );
}

function WorkSpace() {
  return (
    <div>
      {WORKSPACES_DATA.map((workspace) => (
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          key={workspace.id}
          height="500px"
          width="500px"
        >
          {workspace.data.map((brick) => {
            return <RenderBricks key={brick.id} brickData={brick} />;
          })}
        </svg>
      ))}
    </div>
  );
}

export default WorkSpace;
