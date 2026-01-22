import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

import SInputField from './index';

const meta: Meta<typeof SInputField> = {
  title: 'Structural/SInputField',
  component: SInputField,
};

export default meta;
type Story = StoryObj<typeof SInputField>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('Hello');

    return (
      <div style={{ width: '320px' }}>
        <SInputField
          value={value}
          placeholder="Type here..."
          handlerChange={(v) => setValue(v)}
        />
      </div>
    );
  },
};
