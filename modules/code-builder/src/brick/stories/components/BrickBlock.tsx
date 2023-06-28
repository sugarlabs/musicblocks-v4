import BrickBlock from '@/brick/design0/components/BrickBlock';
import type { TBrickBlockProps } from '@/brick/design0/components/BrickBlock';

export default function (props: TBrickBlockProps): JSX.Element {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <BrickBlock {...props} />
    </svg>
  );
}
