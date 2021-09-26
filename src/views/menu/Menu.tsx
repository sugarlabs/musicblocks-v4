import React, { useEffect, useState } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IMenuProps } from '../../@types/menu';
// import { TAppLanguage } from '../../@types/config';

// -- config ---------------------------------------------------------------------------------------

import { MENUAUTOHIDEDELAY, MENUHIDDENONLOAD } from '../../config';
import configColors from '../../configColors.json';

// -- other components -----------------------------------------------------------------------------

import ArrowChevronLeft from '../svg/arrow-chevron-left';
import ArrowChevronRight from '../svg/arrow-chevron-right';
import Checkbox from './Checkbox';
import Slider from './Slider';

// -- stylesheet -----------------------------------------------------------------------------------

import './Menu.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Menu component.
 *
 * @param props - React props (title)
 * @returns root JSX element
 */
export default function (props: IMenuProps): JSX.Element {
  const [brickVisible, setBrickVisible] = useState(true);

  const [playGroupVisible, setPlayGroupVisible] = useState(false);
  const [projectGroupVisible, setProjectGroupVisible] = useState(false);
  const [projectSettingsDialogVisible, setProjectSettingsDialogVisible] = useState(false);
  const [appSettingsDialogVisible, setAppSettingsDialogVisible] = useState(false);

  type TToggleItems = 'play group' | 'project group' | 'project settings' | 'app settings';

  const toggleItemsVisible = () =>
    playGroupVisible ||
    projectGroupVisible ||
    projectSettingsDialogVisible ||
    appSettingsDialogVisible;

  const setToggleItemVisibility = (item: TToggleItems, visible: boolean) => {
    setPlayGroupVisible(false);
    setProjectGroupVisible(false);
    setProjectSettingsDialogVisible(false);
    setAppSettingsDialogVisible(false);

    switch (item) {
      case 'play group':
        setPlayGroupVisible(visible);
        break;
      case 'project group':
        setProjectGroupVisible(visible);
        break;
      case 'project settings':
        setProjectSettingsDialogVisible(visible);
        break;
      case 'app settings':
        setAppSettingsDialogVisible(visible);
        break;
    }
  };

  // Used for menu hide/unhide toggling based on value of props.autoHide and cursor position.
  useEffect(() => {
    const menuWrapperElem = document.getElementById('menu-wrapper') as HTMLElement;
    const menuElem = document.getElementById('menu') as HTMLElement;

    let hidden = MENUHIDDENONLOAD;
    let menuHideTimeout: NodeJS.Timeout;

    function hideMenu() {
      if (toggleItemsVisible()) return;

      if (!hidden) {
        menuHideTimeout = setTimeout(
          () => menuElem.classList.add('menu-hidden'),
          MENUAUTOHIDEDELAY,
        );
        hidden = true;
      }
    }

    function showMenu() {
      if (hidden) {
        if (menuHideTimeout) {
          clearTimeout(menuHideTimeout);
        }
        menuElem.classList.remove('menu-hidden');
        hidden = false;
      }
    }

    if (props.autoHide) {
      menuWrapperElem.onmouseenter = showMenu;
      menuWrapperElem.onmouseleave = hideMenu;
    } else {
      showMenu();
      menuWrapperElem.onmouseenter = null;
      menuWrapperElem.onmouseleave = null;
    }
  });

  // -- render -------------------------------------------------------------------------------------

  return (
    <div id="menu-wrapper">
      <nav id="menu">
        <ul id="menu-buttons">
          <li className="menu-button-wrapper">
            <button className="menu-button">MB</button>
          </li>
          <div className="menu-separator"></div>

          {/* Running controls */}

          <li className="menu-button-group">
            <div className="menu-button-wrapper">
              {!props.playing ? (
                <button className="menu-button" onClick={props.playHandler}>
                  Play
                </button>
              ) : (
                <button className="menu-button" onClick={props.stopHandler}>
                  Stop
                </button>
              )}
            </div>
            <div className="menu-button-toggle-wrapper">
              {playGroupVisible && (
                <React.Fragment>
                  <div className="menu-button-wrapper">
                    <button className="menu-button" onClick={props.playStepHandler}>
                      Play Step
                    </button>
                  </div>
                  <div className="menu-button-wrapper">
                    <button className="menu-button" onClick={props.playSlowHandler}>
                      Play Slow
                    </button>
                  </div>
                </React.Fragment>
              )}
              <button
                className="menu-button-toggle"
                onClick={() => setToggleItemVisibility('play group', !playGroupVisible)}
              >
                {playGroupVisible ? (
                  <ArrowChevronRight fillColor={configColors['menuButtonToggle']} />
                ) : (
                  <ArrowChevronLeft fillColor={configColors['menuButtonToggle']} />
                )}
              </button>
            </div>
          </li>
          <li className="menu-button-wrapper">
            <button className="menu-button" onClick={props.undoHandler}>
              Undo
            </button>
          </li>
          <li className="menu-button-wrapper">
            <button className="menu-button" onClick={props.redoHandler}>
              Redo
            </button>
          </li>
          <div className="menu-separator"></div>

          {/* Interator controls */}

          <li className="menu-button-wrapper">
            <button className="menu-button" onClick={props.clearHandler}>
              Clear
            </button>
          </li>
          <li className="menu-button-wrapper">
            {brickVisible ? (
              <button
                className="menu-button"
                onClick={() => {
                  setBrickVisible(false);
                  props.setBrickVisibility(false);
                }}
              >
                Hide Bricks
              </button>
            ) : (
              <button
                className="menu-button"
                onClick={() => {
                  setBrickVisible(true);
                  props.setBrickVisibility(true);
                }}
              >
                Show Bricks
              </button>
            )}
          </li>
          <li className="menu-button-wrapper">
            <button className="menu-button" onClick={() => props.setBrickFold(true)}>
              Fold Bricks
            </button>
          </li>
          <li className="menu-button-wrapper">
            <button className="menu-button" onClick={() => props.setBrickFold(false)}>
              Unfold Bricks
            </button>
          </li>
          <div className="menu-separator"></div>

          {/* Project controls */}

          <li className="menu-button-group">
            <div className="menu-button-wrapper">
              {!projectGroupVisible ? (
                <button
                  className="menu-button"
                  onClick={() => setToggleItemVisibility('project group', true)}
                >
                  Project
                </button>
              ) : (
                <button
                  className="menu-button"
                  onClick={() => setToggleItemVisibility('project group', false)}
                >
                  ...
                </button>
              )}
            </div>
            <div className="menu-button-toggle-wrapper">
              {projectGroupVisible && (
                <React.Fragment>
                  <div className="menu-button-wrapper">
                    <button className="menu-button" onClick={props.projectSavehandler}>
                      Save Project
                    </button>
                  </div>
                  <div className="menu-button-wrapper">
                    <button className="menu-button" onClick={props.projectLoadHandler}>
                      Load Project
                    </button>
                  </div>
                  <div className="menu-button-wrapper">
                    <button className="menu-button" onClick={props.projectNewHandler}>
                      New Project
                    </button>
                  </div>
                </React.Fragment>
              )}
            </div>
          </li>
          <div className="menu-separator"></div>

          {/* Settings */}

          <li className="menu-button-group">
            <div className="menu-button-wrapper">
              <button
                className="menu-button"
                onClick={() =>
                  setToggleItemVisibility('project settings', !projectSettingsDialogVisible)
                }
              >
                Project Settings
              </button>
            </div>
            {projectSettingsDialogVisible && (
              <div className="menu-dialog">
                <ul className="menu-dialog-items">
                  <li className="menu-dialog-item">
                    <Slider
                      id="menu-master-volume"
                      label="Master Volume"
                      min={props.masterVolumeRange.min}
                      max={props.masterVolumeRange.max}
                      step={1}
                      value={props.masterVolume}
                      changeHandler={(value: number) => props.setMasterVolume(value)}
                    />
                  </li>
                  <li className="menu-dialog-item">Set Pitch</li>
                  <li className="menu-dialog-item">Set Temperament</li>
                </ul>
              </div>
            )}
          </li>
          <li className="menu-button-group">
            <div className="menu-button-wrapper">
              <button
                className="menu-button"
                onClick={() => setToggleItemVisibility('app settings', !appSettingsDialogVisible)}
              >
                Settings
              </button>
            </div>
            {appSettingsDialogVisible && (
              <div className="menu-dialog">
                <ul className="menu-dialog-items">
                  <li className="menu-dialog-item">
                    <Slider
                      id="menu-brick-size"
                      label="Brick Size"
                      min={props.brickSizeRange.min}
                      max={props.brickSizeRange.max}
                      step={1}
                      value={props.brickSize}
                      changeHandler={(value: number) => props.setBrickSize(value)}
                    />
                  </li>
                  <li className="menu-dialog-item">
                    <Checkbox
                      id="menu-auto-hide"
                      label="Auto Hide"
                      checked={props.autoHide}
                      changeHandler={(checked: boolean) => props.setAutoHide(checked)}
                    />
                  </li>
                  <li className="menu-dialog-item">
                    <Checkbox
                      id="menu-horizontal-scroll"
                      label="Horizontal Scroll"
                      checked={props.horizontalScroll}
                      changeHandler={(checked: boolean) => props.setHorizontalScroll(checked)}
                    />
                  </li>
                  <li className="menu-dialog-item">
                    <Checkbox
                      id="menu-sprite-wrap"
                      label="Sprite Wrap"
                      checked={props.spriteWrap}
                      changeHandler={(checked: boolean) => props.setSpriteWrap(checked)}
                    />
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
