import { Workspace } from '@/components/Workspace/Workspace';
import { mockPaletteConfig } from '@/mocks/palette';

export default function WorkspaceDemo() {
  return (
    <div className="h-full w-full bg-indigo-100 p-2">
      <div className="h-full w-full rounded-lg bg-white">
        <Workspace config={{ palette: mockPaletteConfig }} />
      </div>
    </div>
  );
}
