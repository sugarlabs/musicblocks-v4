import { Eye, EyeOff } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace';
import { Button } from '@/ui/button';

/**
 * Workspace-wide show/hide control: a single button that toggles `areBricksHidden` on the
 * workspace store, following the same layout and button conventions as `ScaleControl`.
 */
export function BricksVisibilityControl() {
  const areBricksHidden = useWorkspaceStore((state) => state.areBricksHidden);
  const { setBricksHidden } = useWorkspaceStore.getState();

  return (
    <div className="absolute right-26 bottom-24 z-40 flex h-14 items-center gap-6">
      <Button
        variant="outline"
        size="icon"
        className="size-14 rounded-full border-2"
        aria-label={areBricksHidden ? 'Show blocks' : 'Hide blocks'}
        onClick={() => setBricksHidden(!areBricksHidden)}
      >
        {areBricksHidden ? <EyeOff className="size-6" /> : <Eye className="size-6" />}
      </Button>
    </div>
  );
}

export default BricksVisibilityControl;
