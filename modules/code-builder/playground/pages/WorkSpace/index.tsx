import BrickFactory from './BrickFactory';
import { WORKSPACES_DATA } from './data';
import type { Brick } from './data';

function RenderBricks({ brickData }: { brickData: Brick }) {
  return (
    <>
      <BrickFactory brickData={brickData} />
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
