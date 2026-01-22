import type { JSX } from 'react';

// -- stylesheet --------------------------------------------------
import './index.scss';

// -- component definition ----------------------------------------

export default function (props: {
  /** Current input value */
  value: string;
  /** Placeholder text */
  placeholder?: string;
  /** Disable input */
  disabled?: boolean;
  /** Called when input changes */
  handlerChange: (value: string) => void;
}): JSX.Element {
  return (
    <input
      className="s-input-field"
      type="text"
      value={props.value}
      placeholder={props.placeholder ?? ''}
      disabled={props.disabled ?? false}
      onChange={(e) => props.handlerChange(e.target.value)}
    />
  );
}
