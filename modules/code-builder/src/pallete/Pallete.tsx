import { TBrickArgDataType } from '@/@types/brick';
import { PalleteProps, Tab } from '@/@types/pallete';
import { BrickStatement, ModelBrickStatement } from '@/brick';
import { useState } from 'react';
import withDraggable from './DragHoc';
import './pallete.scss';

const Pallete = (PalleteProps: PalleteProps) => {
  const { config } = PalleteProps;
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<Tab>('flow');
  const [data, setData] = useState(config.data);
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

  const DragBrick = withDraggable(BrickStatement);

  const ResetPallete = () => {
    setSearch('');
    setSelectedTab('flow');
    setData(config.data);
  };

  const searchBlocks = (search: string) => {
    if (search === '') {
      ResetPallete();
      return;
    }
    const newData = data.filter((block) => {
      return block;
    });
    console.log(newData);
    setData([]);
  };

  return (
    <div className="palleteContainer">
      <span>Pallete</span>
      <div className="tabContainer">
        <button
          className="tab"
          onClick={() => setSelectedTab('flow')}
          style={{
            backgroundColor: selectedTab === 'flow' ? '#0096FF' : 'white',
            color: selectedTab === 'flow' ? 'white' : 'black',
          }}
        >
          Flow
        </button>
        <button
          className="tab"
          onClick={() => setSelectedTab('music')}
          style={{
            backgroundColor: selectedTab === 'music' ? '#0096FF' : 'white',
            color: selectedTab === 'music' ? 'white' : 'black',
          }}
        >
          Music
        </button>
        <button
          className="tab"
          onClick={() => setSelectedTab('graphic')}
          style={{
            backgroundColor: selectedTab === 'graphic' ? '#0096FF' : 'white',
            color: selectedTab === 'graphic' ? 'white' : 'black',
          }}
        >
          Graphic
        </button>
      </div>
      <div className="searchContainer">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search"
          onSubmit={() => searchBlocks(search)}
        />
      </div>
      <div className="blocksContainer">
        <DragBrick instance={instance} />
      </div>
    </div>
  );
};

export default Pallete;
