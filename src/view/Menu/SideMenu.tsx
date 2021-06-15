import React from "react";
import "./styles/sideMenu.scss";
import langIcon from "./images/language-icon.png";
import mergeIcon from "./images/merge-icon.png";
import scrollIcon from "./images/enablescroll-icon.png";
import restoreIcon from './images/restore-icon.png';

export const SideMenu: React.FC<{
  className: string;
  onEnableClick: () => void;
  onRestoreClick: () => void;
  onLanguageClick: () => void;
  onMergeClick: () => void;
}> = (props) => {
  return (
    <div className={props.className}>
      <ul>
        <li onClick={props.onEnableClick}>
          <img src={scrollIcon} title="Enable horizontal scroll" />
        </li>
        <li onClick={props.onLanguageClick}>
          <img src={langIcon} title="Language Selection" />
        </li>
        <li onClick={props.onMergeClick}>
          <img src={mergeIcon} title="Merge Project" />
        </li>
        <li onClick={props.onRestoreClick}>
          <img src={restoreIcon} title="Restore from trash" />
        </li>
      </ul>
    </div>
  );
};
