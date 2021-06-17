import React, { useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Tooltip from "@material-ui/core/Tooltip";
import { LanguageState } from "../../types/MenuState";
import "./styles/sideMenu.scss";
import langIcon from "./images/language-icon.png";
import mergeIcon from "./images/merge-icon.png";
import scrollIcon from "./images/enablescroll-icon.png";
import restoreIcon from "./images/restore-icon.png";

const theme = createMuiTheme({
  palette: {
    type: "dark",
  }
});

const LargeTooltip = withStyles(() => ({
  tooltip: {
    fontSize: 15,
  },
}))(Tooltip);

export const SideMenu: React.FC<{
  className: string;
  onEnableClick: () => void;
  onRestoreClick: () => void;
  onLanguageClick: (text: string) => void;
  onMergeClick: () => void;
  languages: LanguageState[]
}> = (props) => {

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<string>("");

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setLanguage(event.target.value as string);
  };

  return (
    <div className={props.className}>
      <ul>
        <LargeTooltip title="Enable Horizontal Scroll" placement="left">
        <li onClick={props.onEnableClick}>
          <img src={scrollIcon}/>
        </li>
        </LargeTooltip>
        <LargeTooltip title="Language Selection" placement="left">
        <li>
          <img src={langIcon} title={open ? "" : "Language Selection"} />
          <br></br>
          <ThemeProvider theme={theme}>
          <FormControl>
            <Select
              // disableUnderline
              labelId="demo-controlled-open-select-label"
              id="demo-controlled-open-select"
              open={open}
              onClose={handleClose}
              onOpen={handleOpen}
              value={language}
              onChange={handleChange}
            >
              {
                props.languages.map((language, index) => (
                  <MenuItem
                    value = {language.label}
                    key={index}
                    onClick={props.onLanguageClick.bind(null, language.label)}
                  >
                    {language.name}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>
          </ThemeProvider>
        </li>
        </LargeTooltip>
        <LargeTooltip title="Merge Project" placement="left">
        <li onClick={props.onMergeClick}>
          <img src={mergeIcon} title="Merge Project" />
        </li>
        </LargeTooltip>
        <LargeTooltip title="Restore from Trash" placement="left">
        <li onClick={props.onRestoreClick}>
          <img src={restoreIcon} title="Restore from trash" />
        </li>
        </LargeTooltip>
      </ul>
    </div>
  );
};
