import { useState } from 'react';
import Canvas from './Canvas';
import Pallete from './Pallete';
import { BrickStatement, ModelBrickStatement } from '@/brick';
import { TBrickArgDataType } from '@/@types/brick';
import withDraggable from './DragHoc';

const Playground = () => {
  const [elements, setElements] = useState<JSX.Element[]>([]);
  const instance = new ModelBrickStatement({
    label: 'Statement',
    args: Object.fromEntries(
      [].map<
        [
          string,
          {
            label: string;
            dataType: TBrickArgDataType;
            meta: unknown;
          },
        ]
      >((name) => [name, { label: name, dataType: 'any', meta: undefined }]),
    ),
    colorBg: 'lightgreen',
    colorFg: 'black',
    outline: 'green',
    scale: 2,
    glyph: '',
    connectAbove: true,
    connectBelow: true,
    name: '',
  });

  const handleElementDrop = (type: string, x: number, y: number) => {
    console.log(type, x, y);
    const DragBrick = withDraggable(BrickStatement);
    const newElement = <DragBrick instance={instance} />;
    setElements([...elements, newElement]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '85vw',
        minHeight: '95vh',
        border: '1px solid black',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '35%',
          height: '95vh',
        }}
      >
        <Pallete
          config={{
            data: [],
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '65%',
        }}
      >
        <Canvas onDrop={handleElementDrop}>{elements}</Canvas>
      </div>
    </div>
  );
};

export default Playground;
