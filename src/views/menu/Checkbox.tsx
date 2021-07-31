import { ICheckboxProps } from '../../@types/menu';

export default function (props: ICheckboxProps): JSX.Element {
  return (
    <button className={props.className}>
      {props.name}
      <label>
        <input
          type="checkbox"
          onClick={(e) => {
            props.onclick((e.target as HTMLInputElement).checked);
          }}
        />
      </label>
    </button>
  );
}
