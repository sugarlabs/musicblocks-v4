import BrickData from '@/brick/design0/components/BrickData';
import type { TBrickDataProps } from '@/brick/design0/components/BrickData';

export default function (props: TBrickDataProps): JSX.Element {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <BrickData {...props} />
    </svg>
  );
}
