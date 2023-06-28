import BrickExpression from '@/brick/design0/components/BrickExpression';
import type { TBrickExpressionProps } from '@/brick/design0/components/BrickExpression';

export default function (props: TBrickExpressionProps): JSX.Element {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      <BrickExpression {...props} />
    </svg>
  );
}
