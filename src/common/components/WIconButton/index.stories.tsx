import type { Meta, StoryObj } from '@storybook/react';

import { default as WIconButton } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Common/WIconButton',
  component: WIconButton,
  decorators: [
    (Story) => (
      <div id="stories-button-wrapper">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      options: ['small', 'big'],
      control: { type: 'select' },
    },
  },
  loaders: [
    async () => {
      const { importAssets, getAsset } = await import('@/core/assets');
      const assetManifest = (await import('@/assets')).default;
      await importAssets(
        Object.entries(assetManifest).map(([identifier, manifest]) => ({ identifier, manifest })),
        () => undefined,
      );

      return {
        asset: getAsset('image.icon.build'),
      };
    },
  ],
  render: (args, { loaded: { asset } }) => <WIconButton {...args} asset={asset} />,
} as Meta<typeof WIconButton>;

type Story = StoryObj<typeof WIconButton>;

// -------------------------------------------------------------------------------------------------

export const ButtonSmall: Story = {
  args: {
    size: 'small',
    handlerClick: () => undefined,
  },
  name: 'Size - small',
};

export const ButtonBig: Story = {
  args: {
    size: 'big',
    handlerClick: () => undefined,
  },
  name: 'Size - big',
};
