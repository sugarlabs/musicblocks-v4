import React, { useState } from 'react';
import { WIconButton, WToggleSwitch, WCheckbox, WTextButton } from './index';
import { TAsset } from '../Structural/SImage';

const TestPage: React.FC = () => {
  const [toggle, setToggle] = useState(false);
  const [checkbox, setCheckbox] = useState(false);

  const asset: TAsset = { kind: 'raster', content: '/path/to/image.png' };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Widget Preview</h2>

      <h3>WIconButton</h3>
      <WIconButton size="big" asset={asset} handlerClick={() => alert('Icon clicked!')} />
      <WIconButton size="small" asset={asset} handlerClick={() => alert('Icon clicked!')} />

      <h3>WTextButton</h3>
      <WTextButton content="Click Me" handlerClick={() => alert('Text button clicked!')} />

      <h3>WToggleSwitch</h3>
      <WToggleSwitch active={toggle} clickHandler={() => setToggle(!toggle)} />

      <h3>WCheckbox</h3>
      <WCheckbox active={checkbox} clickHandler={() => setCheckbox(!checkbox)} />
    </div>
  );
};

export default TestPage;
