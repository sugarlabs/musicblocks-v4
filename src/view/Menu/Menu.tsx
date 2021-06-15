import React, { useState } from "react";
import { SideMenu } from "./SideMenu";
import "./styles/menu.scss";
import settingsIcon from "./images/settings-icon.png";
import playIcon from "./images/play-icon.png";
import stopIcon from "./images/stop-icon.png";
import saveIcon from "./images/save-icon.png";
import newProjectIcon from "./images/new-project.png";
import Logo from "./images/logo.svg";


const Menu: React.FC<{
  onAbout: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSave: () => void;
  onNewProject: () => void;
  onMerge: () => void;
  onEnable: () => void;
  onRestore: () => void;
  onLangSelect: () => void
}> = (props) => {

  const [sideMenu, setSideMenu] = useState(false);

  const showSideMenu = () => {
    setSideMenu(!sideMenu);
  };

  return (
    <div>
      <nav>
        <ul className="menu-container">
          <li>
            <span className="icon-button" onClick={props.onAbout}>
              <img src={Logo} width="72px" />
              Music Blocks
            </span>
          </li>
          <li onClick={props.onPlay} className="icon-buttons">
            <span>
              <img src={playIcon} width="24px" />
              Play
            </span>
          </li>
          <li onClick={props.onStop}>
            <span>
              <img src={stopIcon} width="24px" />
              Stop
            </span>
          </li>
          <li onClick={props.onSave}>
            <span>
              <img src={saveIcon} width="24px" />
              Save
            </span>
          </li>
          <li onClick={props.onNewProject}>
            <span>
              <img src={newProjectIcon} width="24px" />
              New Project
            </span>
          </li>
        </ul>
        <div className="settings-button" onClick={showSideMenu}>
          <img src={settingsIcon} className={sideMenu ? "settings-active" : "settings-inactive"}></img>
        </div>
      </nav>
      <SideMenu
        className={sideMenu ? "side-nav" : "side-nav-inactive"}
        onEnableClick={props.onEnable}
        onRestoreClick={props.onRestore}
        onLanguageClick={props.onLangSelect}
        onMergeClick={props.onMerge}
      />
    </div>
  );
};

export default Menu;