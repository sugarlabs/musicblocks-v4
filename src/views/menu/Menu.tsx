// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '../../@types/config';
import { IMenuProps } from '../../@types/menu';

// -- checkbox component ---------------------------------------------------------------------------

import Checkbox from './Checkbox';

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
  return (
    // auto hide overlay to detect mouseEnter and mouseLeave
    <div
      className="auto-hide-overlay"
      onMouseEnter={() => props.toggleAutoHide()}
      onMouseLeave={() => {
        props.toggleAutoHide();
      }}
    >
      {/* menu wrapper wrapping the entire menu-dock along with its submenus */}
      <div
        id="menu-wrapper"
        onMouseEnter={() => props.toggleAutoHideTemp()}
        onMouseLeave={() => props.toggleAutoHideTemp()}
      >
        {/* main menu-dock */}
        <div
          className={
            props.autoHide && props.autoHideTemp
              ? 'menu-dock menu-dock-inactive'
              : 'menu-dock menu-dock-active'
          }
        >
          <nav>
            <ul>
              <li className="main-menu-btn">
                <div>
                  Music Blocks
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>
                    Music Blocks
                  </span>
                </div>
              </li>

              <hr></hr>

              <li className="main-menu-btn">
                <div onClick={() => props.togglePlayMenu()}>
                  Play
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Play</span>
                </div>

                {/* Play Submenu */}
                <div className={props.playMenuVisible ? 'dropdown-active' : 'inactive-menu'}>
                  <button
                    onClick={() => {
                      props.play();
                      props.togglePlayMenu();
                    }}
                    className="dropdown-btn"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => {
                      props.playSlowly();
                      props.togglePlayMenu();
                    }}
                    className="dropdown-btn"
                  >
                    Play Slowly
                  </button>
                  <button
                    onClick={() => {
                      props.playStepByStep();
                      props.togglePlayMenu();
                    }}
                    className="dropdown-btn"
                  >
                    Play Step by Step
                  </button>
                </div>
              </li>

              <hr></hr>

              <li className="main-menu-btn">
                <div>
                  Search
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Search</span>
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={props.undo}>
                  Undo
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Undo</span>
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={props.redo}>
                  Redo
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Redo</span>
                </div>
              </li>

              <hr></hr>
              <li className="main-menu-btn">
                <div onClick={props.hideBlocks}>
                  Hide Blocks
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>
                    Hide Blocks
                  </span>
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={props.cleanArtwork}>
                  Clean
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Clean</span>
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={props.collapseBlocks}>
                  Collapse Blocks
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>
                    Collapse Blocks
                  </span>
                </div>
              </li>

              <hr></hr>

              <li className="main-menu-btn">
                <div onClick={() => props.toggleProjectMenu()}>
                  Project
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>
                    Project Settings
                  </span>
                </div>

                {/* Project Settings Submenu */}
                <div className={props.projectMenuVisible ? 'dropdown-active' : 'inactive-menu'}>
                  <button
                    onClick={() => {
                      props.toggleProjectMenu();
                    }}
                    className="dropdown-btn"
                  >
                    Save Project
                  </button>
                  <button onClick={() => props.toggleProjectMenu()} className="dropdown-btn">
                    Load Project
                  </button>
                  <button onClick={() => props.toggleProjectMenu()} className="dropdown-btn">
                    New Project
                  </button>
                  <button onClick={() => props.toggleProjectMenu()} className="dropdown-btn">
                    Merge Project
                  </button>
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={() => props.toggleSettingsMenu()}>
                  Settings
                  <span className={props.settingsMenuVisible ? 'inactive-menu' : ''}>Settings</span>
                </div>
                {/* Global Settings Submenu */}
                <div
                  className={props.settingsMenuVisible ? 'settings-menu-active' : 'inactive-menu'}
                >
                  <button onClick={() => props.toggleBlockSizeMenu()}>
                    Set Block Size
                    <div
                      className={
                        props.blockSizeMenuVisible
                          ? 'dropdown-active language-menu'
                          : 'inactive-menu'
                      }
                    >
                      {/* List of all block sizes fetched from Monitor */}
                      {props.blockSizes.map((blockSize) => (
                        <button
                          onClick={() => {
                            props.changeBlockSize(blockSize.size);
                            props.toggleBlockSizeMenu();
                          }}
                          className="dropdown-btn"
                          value={blockSize.label}
                        >
                          {blockSize.label}
                        </button>
                      ))}
                    </div>
                  </button>
                  <button onClick={() => props.toggleLanguageMenu()}>
                    Language
                    <div
                      className={
                        props.languageMenuVisible
                          ? 'dropdown-active language-menu'
                          : 'inactive-menu'
                      }
                    >
                      {/* Language Settings Submenu */}
                      {props.languages.map((lang) => (
                        <button
                          onClick={() => {
                            props.changeLanguage(lang as TAppLanguage);
                            props.toggleLanguageMenu();
                          }}
                          className="dropdown-btn"
                          value={lang}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </button>
                  <Checkbox name="Horizontal Scroll" onclick={props.updateHorizontalScroll} />
                  <Checkbox name="Turtle Wrap" onclick={props.updateTurtleWrap} />
                </div>
              </li>

              <li className="main-menu-btn">
                <div onClick={() => props.toggleMusicSettingsMenu()}>
                  Music <br /> Settings
                  <span className={props.musicSettingsMenuVisible ? 'inactive-menu' : ''}>
                    Music Settings
                  </span>
                </div>

                {/* Project Music Settings Submenu */}
                <div
                  className={
                    props.musicSettingsMenuVisible ? 'settings-menu-active' : 'inactive-menu'
                  }
                >
                  <button>Set Pitch</button>
                  <button>Set Temperament</button>
                  <button>
                    Set Master Volume
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={2}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newValue: number = +e.target.value;
                        props.updateVolume(newValue);
                      }}
                    />
                  </button>
                  <button>View Status</button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
