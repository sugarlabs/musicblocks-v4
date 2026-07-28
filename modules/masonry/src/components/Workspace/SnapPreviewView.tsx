import { useMemo } from 'react';
import type { BrickViewPropsWithModel } from '@/@types/brick.types';
import { BrickView } from '@/components/Brick/Brick';
import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { usePaletteDragStore } from '@/stores/palette';
import { useWorkspaceStore } from '@/stores/workspace';
import { useBrickLayoutStore } from '@/stores/brick';
import { createBrickModel } from '@/utils/brick-model-factory';
import { listNodes } from '@/utils/tower-traversal';

export function SnapPreviewView() {
  const activeTarget = useConnectionPreviewStore((state) => state.activeTarget);
  const isValid = useConnectionPreviewStore((state) => state.isValid);
  const snapPosition = useConnectionPreviewStore((state) => state.snapPosition);

  const towers = useWorkspaceStore((state) => state.towers);
  const paletteDragged = usePaletteDragStore((state) => state.dragged);

  const targetTower = activeTarget ? towers[activeTarget.draggedTowerId] : null;

  const paletteModel = useMemo(() => {
    if (activeTarget?.draggedTowerId === 'temp-palette-drag' && paletteDragged) {
      return createBrickModel(paletteDragged.brick);
    }
    return null;
  }, [activeTarget, paletteDragged]);

  if (!activeTarget || !isValid || !snapPosition) return null;

  // Single palette brick preview
  if (paletteModel) {
    const viewProps = {
      kind: paletteModel.kind,
      model: paletteModel,
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

  // Workspace tower preview
  if (targetTower) {
    const nodes = listNodes(targetTower.root);
    const rootCoords = useBrickLayoutStore.getState().coords[targetTower.root.model.id] || {
      x: 0,
      y: 0,
    };

    return (
      <div
        data-testid="snap-preview-view"
        className="pointer-events-none absolute top-0 left-0 z-30 opacity-60 drop-shadow-[0_0_12px_rgba(34,197,94,0.7)] filter"
        style={{
          transform: `translate(${snapPosition.x}px, ${snapPosition.y}px)`,
        }}
      >
        {nodes.map((node) => {
          const viewProps = {
            kind: node.kind,
            model: node.model,
          } as unknown as BrickViewPropsWithModel;

          const coords = useBrickLayoutStore.getState().coords[node.model.id] || { x: 0, y: 0 };
          const offsetX = coords.x - rootCoords.x;
          const offsetY = coords.y - rootCoords.y;

          return (
            <div
              key={node.model.id}
              className="absolute"
              style={{
                transform: `translate(${offsetX}px, ${offsetY}px)`,
              }}
            >
              <BrickView {...viewProps} />
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
