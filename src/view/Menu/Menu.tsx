import React, { useState } from "react";
import Tooltip from "@material-ui/core/Tooltip";
import Zoom from "@material-ui/core/Zoom";
import { withStyles } from "@material-ui/core/styles";
import { SideMenu } from "./SideMenu";
import { MenuModelState } from "../../types/MenuState";
import "./styles/menu.scss";
import settingsIcon from "./images/settings-icon.png";
import playIcon from "./images/play-icon.png";
import stopIcon from "./images/stop-icon.png";
import saveIcon from "./images/save-icon.png";
import newProjectIcon from "./images/new-project.png";
import Logo from "./images/logo.svg";

const LargeTooltip = withStyles(() => ({
  tooltip: {
    fontSize: 15,
  },
}))(Tooltip);

const Menu: React.FC<{
  onAbout: () => void;
  onPlay: () => void;
  onStop: () => void;
  onSave: () => void;
  onNewProject: () => void;
  onMerge: () => void;
  onEnable: () => void;
  onRestore: () => void;
  onLangSelect: (text: string) => void
  model: MenuModelState
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
            <LargeTooltip title="Music Blocks" TransitionComponent={Zoom}>
            <span className="icon-button" onClick={props.onAbout}>
              <img src={Logo} width="72px" />
              Music Blocks
            </span>
            </LargeTooltip>
          </li>
          <li onClick={props.onPlay} className="icon-buttons">
            <LargeTooltip title="Play" TransitionComponent={Zoom}>
            <span>
              <img src={playIcon} width="24px" />
              {/* Play */}
            </span>
            </LargeTooltip>
          </li>
          <li onClick={props.onStop}>
          <LargeTooltip title="Stop" TransitionComponent={Zoom}>
            <span>
              <img src={stopIcon} width="24px" />
              {/* Stop */}
            </span>
            </LargeTooltip>
          </li>
          <li onClick={props.onSave}>
          <LargeTooltip title="Save" TransitionComponent={Zoom}>
            <span>
              <img src={saveIcon} width="24px" />
              {/* Save */}
            </span>
            </LargeTooltip>
          </li>
          <li onClick={props.onNewProject}>
          <LargeTooltip title="New Project" TransitionComponent={Zoom}>
            <span>
              <img src={newProjectIcon} width="24px" />
              {/* New Project */}
            </span>
            </LargeTooltip>
          </li>
        </ul>
        <div className="settings-button" onClick={showSideMenu}>
          <LargeTooltip title={sideMenu ? "" : "Additional Settings"} TransitionComponent={Zoom}>
            <img src={settingsIcon} className={sideMenu ? "settings-active" : "settings-inactive"}></img>
          </LargeTooltip>
        </div>
      </nav>
      <SideMenu
        className={sideMenu ? "side-nav" : "side-nav-inactive"}
        onEnableClick={props.onEnable}
        onRestoreClick={props.onRestore}
        onLanguageClick={props.onLangSelect}
        onMergeClick={props.onMerge}
        languages={props.model.languages}
      />
    </div>
  );
};

export default Menu;