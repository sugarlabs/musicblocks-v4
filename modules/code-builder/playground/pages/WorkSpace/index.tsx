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
import type { Brick } from './data';

function getBrick(brickData: Brick) {
  switch (brickData.type) {
    case 'data':
      return (
        <BrickData
          id={brickData.id}
          instance={brickData.instance as ModelBrickData}
          coords={brickData.coords}
        />
      );
    case 'expression':
      return (
        <BrickExpression
          id={brickData.id}
          instance={brickData.instance as ModelBrickExpression}
          coords={brickData.coords}
        />
      );
    case 'statement':
      return (
        <BrickStatement
          id={brickData.id}
          instance={brickData.instance as ModelBrickStatement}
          coords={brickData.coords}
        />
      );
    case 'block':
      return (
        <BrickBlock
          id={brickData.id}
          brickData={brickData}
          instance={brickData.instance as ModelBrickBlock}
          coords={brickData.coords}
        />
      );
    default:
      return <></>;
  }
}

function RenderBricks({ brickData }: { brickData: Brick }) {
  return (
    <>
      {getBrick(brickData)}
      {brickData.children &&
        brickData.children?.length > 0 &&
        brickData.children.map((child) => <RenderBricks key={child.id} brickData={child} />)}
    </>
  );
}

function WorkSpace() {
  return (
    <div style={{ padding: '20px 50px' }}>
      {WORKSPACES_DATA.map((workspace) => (
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          key={workspace.id}
          height="700px"
          width="800px"
          style={{ border: '2px solid black' }}
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
