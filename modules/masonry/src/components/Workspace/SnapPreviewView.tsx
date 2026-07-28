import { useMemo } from 'react';
import type { BrickViewProps, BrickViewPropsWithModel } from '@/@types/brick.types';
import { BrickView } from '@/components/Brick/Brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { createBrickModel } from '@/utils/brick-model-factory';

export function SnapPreviewView() {
  const activeTarget = useConnectionPreviewStore((state) => state.activeTarget);
  const isValid = useConnectionPreviewStore((state) => state.isValid);
  const snapPosition = useConnectionPreviewStore((state) => state.snapPosition);

  const shadowModel = useMemo(() => {
    if (!activeTarget) return null;

    const colors = { background: '#9ca3af', foreground: 'transparent', border: '#6b7280' };

    if (activeTarget.type === 'statement') {
      const props: BrickViewProps = {
        kind: 'statement',
        widget: { type: 'label', text: '' },
        colorsDefault: colors,
        hasConnectionPrev: true,
        hasConnectionNext: true,
        tooltipText: '',
        scaleLevel: 2,
      };
      return createBrickModel(props);
    } else {
      const props: BrickViewProps = {
        kind: 'value',
        widget: { type: 'label', text: '' },
        colorsDefault: colors,
        tooltipText: '',
        scaleLevel: 2,
      };
      return createBrickModel(props);
    }
  }, [activeTarget]);

  if (!activeTarget || !isValid || !snapPosition || !shadowModel) return null;

  const viewProps = {
    kind: shadowModel.kind,
    model: shadowModel,
  } as unknown as BrickViewPropsWithModel;

  return (
    <div
      data-testid="snap-preview-view"
      className="pointer-events-none absolute top-0 left-0 z-30 opacity-60 drop-shadow-[0_0_12px_rgba(34,197,94,0.7)] filter"
      style={{
        transform: `translate(${snapPosition.x}px, ${snapPosition.y}px)`,
      }}
    >
      <BrickView {...viewProps} />
    </div>
  );
}
