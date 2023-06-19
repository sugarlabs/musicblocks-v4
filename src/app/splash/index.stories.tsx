import type { Meta, StoryObj } from '@storybook/react';

import { Splash } from '.';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'View/Splash',
  component: Splash,
  decorators: [
    (Story) => (
      <div id="stories-splash-wrapper">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    progress: {
      options: [0, 20, 40, 60, 80, 100],
      control: { type: 'select' },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
  render: (args, { loaded: { logo } }) => <Splash {...args} logo={logo} />,
  loaders: [
    async () => {
      const { importAssets, getAsset } = await import('@sugarlabs/mb4-assets');
      const assetManifest = (await import('@/assets')).default;
      await importAssets(
        Object.entries(assetManifest).map(([identifier, manifest]) => ({ identifier, manifest })),
        () => undefined,
      );
      return {
        logo: getAsset('image.logo'),
      };
    },
  ],
} as Meta<typeof Splash>;

type Story = StoryObj<typeof Splash>;

// -------------------------------------------------------------------------------------------------

export const SplashProgress: Story = {
  args: {
    progress: 0,
  },
  name: 'Progress',
};
