import type { ComponentStory, ComponentMeta } from '@storybook/react';
import type { TInjectedMenu } from '@/@types/components/menu';

import { Menu } from '.';
import { definition } from '../..';

// -------------------------------------------------------------------------------------------------

export default {
  title: 'Components/Menu',
  component: Menu,
  decorators: [
    (Story) => (
      <div id="stories-menu-wrapper">
        <div id="menu" className="stories-menu">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  loaders: [
    async () => {
      const { importStrings, getStrings } = await import('@/core/i18n');
      await importStrings('es');

      const { importAssets, getAssets } = await import('@/core/assets');
      const assetManifest = (await import('@/assets')).default;
      await importAssets(
        Object.entries(assetManifest).map(([identifier, manifest]) => ({ identifier, manifest })),
        () => undefined,
      );

      return {
        i18n: getStrings(Object.keys(definition.strings)),
        assets: getAssets(definition.assets!),
      };
    },
  ],
} as ComponentMeta<typeof Menu>;

const Template: ComponentStory<typeof Menu> = (args, { loaded: { i18n, assets } }) => (
  <Menu
    {...args}
    {...{
      injected: {
        flags: args.injected.flags,
        i18n,
        assets,
      },
    }}
  />
);

// -------------------------------------------------------------------------------------------------

const injected: TInjectedMenu = {
  flags: {
    uploadFile: false,
    recording: false,
    exportDrawing: false,
    loadProject: false,
    saveProject: false,
  },
  // @ts-ignore
  i18n: {},
  // @ts-ignore
  assets: {},
};

// == state - not running ==================================

export const StateNotRunning = Template.bind({});
StateNotRunning.args = {
  states: { running: false },
  injected,
};
StateNotRunning.storyName = 'State - Not Running';

// == state - running ======================================

export const StateRunning = Template.bind({});
StateRunning.args = {
  states: { running: true },
  injected,
};
StateRunning.storyName = 'State - Running';

// == flags - upload file ==================================

export const FlagsUploadFile = Template.bind({});
FlagsUploadFile.args = {
  states: { running: false },
  injected: {
    flags: {
      ...injected.flags,
      uploadFile: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsUploadFile.storyName = 'Flags - Upload File';

// == flags - recording ====================================

export const FlagsRecording = Template.bind({});
FlagsRecording.args = {
  states: { running: false },
  injected: {
    flags: {
      ...injected.flags,
      recording: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsRecording.storyName = 'Flags - Recording';

// == flags - export drawing ===============================

export const FlagsExportDrawing = Template.bind({});
FlagsExportDrawing.args = {
  states: { running: false },
  injected: {
    flags: {
      ...injected.flags,
      exportDrawing: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsExportDrawing.storyName = 'Flags - Export Drawing';

// == flags - load project =================================

export const FlagsLoadProject = Template.bind({});
FlagsLoadProject.args = {
  states: { running: false },
  injected: {
    flags: {
      ...injected.flags,
      loadProject: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsLoadProject.storyName = 'Flags - Load Project';

// == flags - save project =================================

export const FlagsSaveProject = Template.bind({});
FlagsSaveProject.args = {
  states: { running: false },
  injected: {
    flags: {
      ...injected.flags,
      saveProject: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsSaveProject.storyName = 'Flags - Save Project';

// == flags - all ==========================================

export const FlagsAll = Template.bind({});
FlagsAll.args = {
  states: { running: false },
  injected: {
    flags: {
      uploadFile: true,
      recording: true,
      exportDrawing: true,
      loadProject: true,
      saveProject: true,
    },
    i18n: { ...injected.i18n },
    assets: { ...injected.assets },
  },
};
FlagsAll.storyName = 'Flags - All';
