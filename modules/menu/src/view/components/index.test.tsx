import type { TAsset } from '#/@types/assets';
import type { TPropsMenu } from '#/@types/components/menu';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Menu } from '.';

afterEach(cleanup);

const pngAsset: TAsset = {
  type: 'image/png',
  data: 'data:image/png;base64,iVBORw0KGgo=',
  meta: { width: 1, height: 1 },
};

const props = (overrides: Partial<TPropsMenu> = {}): TPropsMenu => ({
  injected: {
    flags: {
      uploadFile: false,
      recording: false,
      exportDrawing: true,
      loadProject: false,
      saveProject: false,
    },
    i18n: {
      'menu.run': 'run',
      'menu.stop': 'stop',
      'menu.reset': 'reset',
    },
    assets: {
      'image.icon.run': pngAsset,
      'image.icon.stop': pngAsset,
      'image.icon.reset': pngAsset,
      'image.icon.saveProjectHTML': pngAsset,
      'image.icon.exportDrawing': pngAsset,
      'image.icon.startRecording': pngAsset,
      'image.icon.stopRecording': pngAsset,
      'image.icon.uploadFile': pngAsset,
      'image.icon.loadProject': pngAsset,
    },
  },
  states: { running: false },
  handlers: {},
  ...overrides,
});

describe('Menu export drawing button', () => {
  it('invokes the exportDrawing handler when the Save mouse artwork as PNG button is clicked', () => {
    const exportDrawing = vi.fn();
    render(<Menu {...props({ handlers: { exportDrawing } })} />);

    fireEvent.click(screen.getByText('Save mouse artwork as PNG'));

    expect(exportDrawing).toHaveBeenCalledTimes(1);
  });
});
