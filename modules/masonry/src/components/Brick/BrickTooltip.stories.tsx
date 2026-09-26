import type { Meta, StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useBrickTooltip } from '@/hooks/useBrickTooltip';
import { StatementBrickModel } from '@/models/brick';

import { BrickView } from './Brick';
import { BrickTooltip } from './BrickTooltip';

// BrickTooltip renders into document.body at a fixed position, placed against an anchor's client
// rect, so every story draws a real element and measures it rather than passing a made-up rect.
const meta: Meta = {
  title: 'Brick/BrickTooltip',
  component: BrickTooltip,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

const SHORT = 'Plays one note for the given duration';
const LONG =
  'Repeats the bricks inside it the given number of times, then carries on with whatever comes after the loop, so a long tooltip like this one wraps rather than running off the side of the window';

/** A statement brick to hang the tooltip from, drawn the way the palette and workspace draw one. */
function NoteBrick() {
  const model = useMemo(
    () =>
      new StatementBrickModel({
        colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
        tooltipText: SHORT,
        widget: { type: 'label', text: 'Note' },
        params: [],
      }),
    [],
  );

  return <BrickView kind="statement" model={model} />;
}

/** Draws `children` and a tooltip against it, open from the start, for the placement stories. */
function Anchored(props: { text: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (ref.current !== null) setAnchor(ref.current.getBoundingClientRect());
  }, []);

  return (
    <>
      <div ref={ref} className="w-fit" style={props.style}>
        <NoteBrick />
      </div>
      {anchor !== null && <BrickTooltip id="story-tooltip" text={props.text} anchor={anchor} />}
    </>
  );
}

// ─── Interaction ─────────────────────────────────────────────────────────────

/** Hover the brick, or tab to it: the tooltip opens after the delay and closes on leave or blur. */
function HoverTrigger() {
  const tooltip = useBrickTooltip(SHORT);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Note"
        className="w-fit"
        onPointerEnter={(event) => tooltip.show(event.currentTarget, 'pointer')}
        onPointerLeave={() => tooltip.hide('pointer')}
        onPointerDown={() => tooltip.hide()}
        onFocus={(event) => tooltip.show(event.currentTarget, 'focus')}
        onBlur={() => tooltip.hide('focus')}
      >
        <NoteBrick />
      </div>
      {tooltip.anchor !== null && (
        <BrickTooltip id="story-tooltip" text={SHORT} anchor={tooltip.anchor} />
      )}
    </>
  );
}

export const OnHover: Story = {
  render: () => <HoverTrigger />,
};
OnHover.storyName = 'On hover or focus';

// ─── Placement ───────────────────────────────────────────────────────────────

export const Above: Story = {
  render: () => <Anchored text={SHORT} />,
};
Above.storyName = 'Above the brick';

export const FlipsBelow: Story = {
  parameters: { layout: 'fullscreen' },
  // Pinned to the top of the window, so there is no room above and it flips underneath.
  render: () => <Anchored text={SHORT} style={{ margin: '8px 0 0 16px' }} />,
};
FlipsBelow.storyName = 'Flips below near the top';

export const LongTextWraps: Story = {
  render: () => <Anchored text={LONG} />,
};
LongTextWraps.storyName = 'Long text wraps';
