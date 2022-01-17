// -- types ----------------------------------------------------------------------------------------

import { IArtboardManagerViewProps } from '../../../../@types/artboard';

// -- config ---------------------------------------------------------------------------------------

import { Z_INDEX_ARTBOARD_SPRITE_WRAPPER, Z_INDEX_ARTBOARD_WRAPPER } from '../../../../config';

// -- stylesheet -----------------------------------------------------------------------------------

import './ArtboardManager.scss';

// -- view component definition --------------------------------------------------------------

/**
 * View of the Artboard Manager component.
 *
 * @param props - React props
 * @returns root JSX element
 */
export default function (props: IArtboardManagerViewProps): JSX.Element {
  return (
    <div id="artboard-manager-wrapper">
      <h4 id="artboard-dimensions">
        Artboard {`(${props.viewportDimensions[0]} × ${props.viewportDimensions[1]})`}
      </h4>

      <div id="artboard-wrapper" style={{ zIndex: Z_INDEX_ARTBOARD_WRAPPER }}>
        {Object.keys(props.artboardMap).map((artboardID) =>
          props.children['Artboard']({
            artboardID,
            spriteID: props.artboardMap[artboardID],
            initialPosition: props.initialPosition,
            initialHeading: props.initialHeading,
          }),
        )}
      </div>

      <div id="artboard-sprite-wrapper" style={{ zIndex: Z_INDEX_ARTBOARD_SPRITE_WRAPPER }}>
        {Object.keys(props.artboardMap).map((artboardID) =>
          props.children['ArtboardSprite']({
            artboardID,
            spriteID: props.artboardMap[artboardID],
            initialPosition: props.initialPosition,
            initialHeading: props.initialHeading,
            color: { accent: '#fff', outline: '#000000' },
          }),
        )}
      </div>
    </div>
  );
}
