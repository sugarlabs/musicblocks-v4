// -- types ----------------------------------------------------------------------------------------

import { IMenuProps } from '../../@types/menu';

import { ContextConfig } from '../../context/context-config';

// -- stylesheet -----------------------------------------------------------------------------------

import './Menu.scss';

import { useContext } from 'react';

// -- view component definition --------------------------------------------------------------------

/**
 * View of the Menu component.
 *
 * @param props - React props (title)
 * @returns root JSX element
 */
export default function (props: IMenuProps): JSX.Element {
  const { config, setConfig } = useContext(ContextConfig);

  return (
    <div>
      <div
        className="auto-hide-overlay"
        onMouseEnter={() => props.toggleAutoHide()}
        onMouseLeave={() => {
          props.toggleAutoHide();
        }}
      ></div>
      <div
        id="menu-wrapper"
        onMouseEnter={() => props.toggleAutoHideTemp()}
        onMouseLeave={() => props.toggleAutoHideTemp()}
      >
        <div className={props.autoHide && props.autoHideTemp ? 'menu-dock-inactive' : 'menu-dock'}>
          <nav>
            <ul>
              <li className="main-menu-btn">
                <div>
                  Music Blocks
                  <span>Music Blocks</span>
                </div>
              </li>
              <hr></hr>
              <li className="main-menu-btn">
                <div onClick={() => props.togglePlayMenu()}>
                  Play
                  <span>Play</span>
                </div>
                <div className={props.playMenuVisible ? 'dropdown-active' : 'dropdown-inactive'}>
                  <button onClick={() => props.togglePlayMenu()} className="dropdown-btn">
                    Play
                  </button>
                  <button onClick={() => props.togglePlayMenu()} className="dropdown-btn">
                    Play Slowly
                  </button>
                  <button onClick={() => props.togglePlayMenu()} className="dropdown-btn">
                    Play Step by Step
                  </button>
                </div>
              </li>
              <hr></hr>
              <li className="main-menu-btn">
                <div>
                  Search
                  <span>Search</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Undo
                  <span>Undo</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Redo
                  <span>Redo</span>
                </div>
              </li>
              <hr></hr>
              <li className="main-menu-btn">
                <div>
                  Palette#1
                  <span>Palette #1</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Palette#2
                  <span>Palette #2</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Palette#3
                  <span>Palette #3</span>
                </div>
              </li>
              <hr></hr>
              <li className="main-menu-btn">
                <div onClick={() => props.toggleSettingsMenu()}>
                  Settings
                  <span>Settings</span>
                </div>
                <div
                  className={props.settingsMenuVisible ? 'dropdown-active' : 'dropdown-inactive'}
                >
                  <button
                    onClick={() => {
                      props.toggleSettingsMenu();
                    }}
                    className="dropdown-btn"
                  >
                    Merge Project
                  </button>
                  <button onClick={() => props.toggleSettingsMenu()} className="dropdown-btn">
                    Horizontal Scroll
                  </button>
                  <button onClick={() => props.toggleSettingsMenu()} className="dropdown-btn">
                    Help
                  </button>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  New Project
                  <span>New Project</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Save Project
                  <span>Save Project</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div onClick={() => props.toggleLanguageMenu()}>
                  Language
                  <span>Language</span>
                </div>
                <div
                  className={
                    props.languageMenuVisible
                      ? 'dropdown-active language-menu'
                      : 'dropdown-inactive'
                  }
                >
                  {props.languages.map((lang) => (
                    <button
                      onClick={() => {
                        setConfig({ ...config, language: lang });
                        props.toggleLanguageMenu();
                      }}
                      className="dropdown-btn"
                      value={lang}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
