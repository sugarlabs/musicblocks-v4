// -- types ----------------------------------------------------------------------------------------

import { IMenuProps } from '../../@types/menu';

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
                  Hide Blocks
                  <span>Hide Blocks</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Clean
                  <span>Clean</span>
                </div>
              </li>
              <li className="main-menu-btn">
                <div>
                  Collapse Blocks
                  <span>Collapse Blocks</span>
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
                  <button onClick={() => props.toggleSettingsMenu()} className="dropdown-btn">
                    Horizontal Scroll
                  </button>
                  <button onClick={() => props.toggleSettingsMenu()} className="dropdown-btn">
                    Help
                  </button>
                </div>
              </li>
              <li className="main-menu-btn">
                <div onClick={() => props.toggleProjectMenu()}>
                  Project
                  <span>Project Settings</span>
                </div>
                <div className={props.projectMenuVisible ? 'dropdown-active' : 'dropdown-inactive'}>
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
                      onClick={() => props.changeLanguage(lang)}
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
