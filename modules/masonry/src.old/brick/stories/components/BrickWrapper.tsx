import type { PropsWithChildren } from 'react';

// -------------------------------------------------------------------------------------------------

export default function (props: PropsWithChildren): JSX.Element {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg">
      {props.children}
    </svg>
  );
}
