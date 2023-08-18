import { TBrickArgDataType } from '@/@types/brick';
import { BrickStatement, ModelBrickStatement } from '@/brick';
import { useState } from 'react';
import Canvas from './Canvas';
import withDraggable from './DragHoc';
import Pallete from './Pallete';

const Playground = () => {
  const [reset, setReset] = useState(false);

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

  const handleBrickDrop = () => {
    console.log('handleBrickDrop');
    const DragBrick = withDraggable(BrickStatement);
    const newElement = <DragBrick instance={instance} />;
    setElements([...elements, newElement]);
    setReset(true);
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
          onBrickDrop={handleBrickDrop}
          reset={reset}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '65%',
        }}
      >
        <Canvas>{elements}</Canvas>
      </div>
    </div>
  );
};

export default Playground;
