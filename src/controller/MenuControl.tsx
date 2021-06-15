import React from "react";
import Menu from "../view/Menu/Menu";

export default function MenuControl(): JSX.Element {
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

  const languageSelect = () => {
    console.log("Select a language");
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
      />
    </div>
  );
}