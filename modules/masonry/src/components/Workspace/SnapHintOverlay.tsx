import { useConnectionPreviewStore } from '@/stores/connection-preview';
import { useWorkspaceStore } from '@/stores/workspace';

export function SnapHintOverlay() {
  const activeTarget = useConnectionPreviewStore((state) => state.activeTarget);
  const isValid = useConnectionPreviewStore((state) => state.isValid);
  const towers = useWorkspaceStore((state) => state.towers);

  if (!activeTarget) return null;

  const { centroid, draggedTowerId } = activeTarget;

  const draggedTower = towers[draggedTowerId];
  const modelColors = draggedTower?.root?.model?.colorsDefault;

  const bgColor = isValid
    ? modelColors
      ? `${modelColors.background}80`
      : 'rgba(34, 197, 94, 0.4)'
    : 'rgba(239, 68, 68, 0.4)';
  const borderColor = isValid
    ? modelColors
      ? modelColors.border
      : 'rgba(20, 83, 45, 0.8)'
    : 'rgba(153, 27, 27, 0.8)';
  const glow = isValid
    ? modelColors
      ? `${modelColors.background}80`
      : 'rgba(34, 197, 94, 0.5)'
    : 'rgba(239, 68, 68, 0.5)';

  return (
    <div
      data-testid="snap-hint-overlay"
      className="pointer-events-none absolute z-40 h-3 w-3 rounded-full transition-all duration-100 ease-out"
      style={{
        left: centroid.x,
        top: centroid.y,
        transform: `translate(-50%, -50%) ${isValid ? 'scale(1.2)' : 'scale(1)'}`,
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        boxShadow: `0 0 10px 4px ${glow}`,
      }}
    />
  );
}
