import { useMemo } from 'react';
import type { BrickViewProps, BrickViewPropsWithModel } from '@/@types/brick.types';
import { BrickView } from '@/components/Brick/Brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { findNodeAndTower } from '@/stores/workspace';
import { useBrickLayoutStore } from '@/stores/brick';
import { createBrickModel } from '@/utils/brick-model-factory';
import { SCALE_LEVEL_CONFIG } from '@/utils/constants';

export function DisconnectShadowView() {
  const disconnectShadow = useConnectionPreviewStore((state) => state.disconnectShadow);
  const hostCoords = useBrickLayoutStore((state) =>
    disconnectShadow ? state.coords[disconnectShadow.hostBrickId] : null,
  );

  const shadowModel = useMemo(() => {
    if (!disconnectShadow) return null;

    const colors = { background: '#d1d5db', foreground: 'transparent', border: '#9ca3af' };

    if (typeof disconnectShadow.socket === 'number' || disconnectShadow.socket === 'output') {
      const props: BrickViewProps = {
        kind: 'value',
        widget: { type: 'label', text: 'Pan' },
        colorsDefault: colors,
        tooltipText: '',
        scaleLevel: 2,
      };
      return createBrickModel(props);
    } else {
      const props: BrickViewProps = {
        kind: 'statement',
        widget: { type: 'label', text: 'Beat Count' },
        colorsDefault: colors,
        hasConnectionPrev: true,
        hasConnectionNext: true,
        tooltipText: '',
        scaleLevel: 2,
      };
      return createBrickModel(props);
    }
  }, [disconnectShadow]);

  const snapPosition = useMemo(() => {
    if (!disconnectShadow || !shadowModel || !hostCoords) return null;

    const found = findNodeAndTower(disconnectShadow.hostBrickId);
    if (!found) return null;

    const hostModel = found.node.model;
    const connectors = hostModel.getConnectorCoords();

    let hostBounds = null;
    if (disconnectShadow.socket === 'next') hostBounds = connectors.next;
    else if (disconnectShadow.socket === 'nestedNext') hostBounds = connectors.nestedNext;
    else if (typeof disconnectShadow.socket === 'number') {
      hostBounds = connectors.inputs[disconnectShadow.socket];
    } else if (disconnectShadow.socket === 'output') hostBounds = connectors.output;

    const hostScale = SCALE_LEVEL_CONFIG[hostModel.scaleLevel].brickScale;
    const hx = hostCoords.x + (hostBounds ? hostBounds.x * hostScale : 0);
    const hy = hostCoords.y + (hostBounds ? hostBounds.y * hostScale : 0);

    const shadowScale = SCALE_LEVEL_CONFIG[shadowModel.scaleLevel].brickScale;
    const shadowConnectors = shadowModel.getConnectorCoords();
    const shadowBounds =
      typeof disconnectShadow.socket === 'number' || disconnectShadow.socket === 'output'
        ? shadowConnectors.output
        : shadowConnectors.prev;

    const dx = shadowBounds ? shadowBounds.x * shadowScale : 0;
    const dy = shadowBounds ? shadowBounds.y * shadowScale : 0;

    const strokeWidthOffset = 2 * hostScale; // STROKE_WIDTH = 2
    let snapX = hx - dx;
    let snapY = hy - dy;

    // The layout engine makes strokes abut rather than overlap
    if (typeof disconnectShadow.socket === 'number' || disconnectShadow.socket === 'output') {
      snapX += strokeWidthOffset;
    } else {
      snapY += strokeWidthOffset;
    }

    return {
      x: snapX,
      y: snapY,
    };
  }, [disconnectShadow, hostCoords, shadowModel]);

  if (!disconnectShadow || !snapPosition || !shadowModel) return null;

  const viewProps = {
    kind: shadowModel.kind,
    model: shadowModel,
  } as unknown as BrickViewPropsWithModel;

  return (
    <div
      data-testid="disconnect-shadow-view"
      className="pointer-events-none absolute top-0 left-0 z-20 opacity-80"
      style={{
        transform: `translate(${snapPosition.x}px, ${snapPosition.y}px)`,
      }}
    >
      <BrickView {...viewProps} />
    </div>
  );
}
