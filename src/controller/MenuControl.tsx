import React, { useReducer, useRef } from "react";
import {MenuModel} from "../models/menuModel";
import { MenuModelState, ActionState } from "../types/MenuState";
import Menu from "../view/Menu/Menu";

const reducer = (state: MenuModelState, action: ActionState): MenuModelState => {
  switch(action.type){
    case "updateLanguage":
      return {...state, selectedLanguage: action.payload};
  }
};

export default function MenuControl(): JSX.Element {
  const [menumodel, dispatch] = useReducer(reducer, MenuModel);

  const playFast = () => {
    console.log("Play Project Fast");
  };

  const showAboutPage = () => {
    console.log("Display the About MusicBlocks Page");
  };

  const hardStop = () => {
    console.log("Stop playing project");
  };

  const saveProject = () => {
    console.log("Save Project as HTML");
  };

  const newProject = () => {
    console.log("Create New Project");
  };

  const mergeProject = () => {
    console.log("Load Project");
  };

  const enableScroll = () => {
    console.log("Enable Horizontal Scroll");
  };

  const restore = () => {
    console.log("Restore recently deleted block");
  };

  const languageSelect = (text: string) => {
    console.log("called");
    dispatch({ type: "updateLanguage", payload: text});
    console.log("Select a language: " + text);
  };

  return (
    <div>
      <Menu
        onAbout={showAboutPage}
        onPlay={playFast}
        onStop={hardStop}
        onSave={saveProject}
        onNewProject={newProject}
        onMerge={mergeProject}
        onEnable={enableScroll}
        onRestore={restore}
        onLangSelect={languageSelect}
        model={menumodel}
      />
    </div>
  );
}