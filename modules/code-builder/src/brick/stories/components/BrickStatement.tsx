import BrickStatement from '@/brick/design0/components/BrickStatement';
import type { TBrickStatementProps } from '@/brick/design0/components/BrickStatement';

export default function (props: TBrickStatementProps): JSX.Element {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <BrickStatement {...props} />
    </svg>
  );
}
