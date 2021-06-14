import React, { useState } from "react";
import { blockList, buttonList, category } from "../dummyEngine";
import BlockView from "../view/Palette/BlockView";
import PaletteView from "../view/Palette/PaletteView";
import SubCategoryView from "../view/Palette/SubCategoryView";

const PaletteContoller: React.FC = () => {
  const [showMenu, SetShowMenu] = useState(false);
  const [selectedCategory, SetSelectedCategory] = useState<string>("");
  const [showBlocks, SetShowBlocks] = useState(false);
  const [selectedSubCategory, SetSelectedSubCategory] = useState<string>("");

  const onClickCategory = (text: string) => {
    SetShowMenu(true);
    SetShowBlocks(false);
    SetSelectedCategory(text);
  };

  const removeSubCategory = () => {
    SetShowMenu(false);
  };

  const onClickSubCategory = (text: string) => {
    SetShowBlocks(true);
    SetSelectedSubCategory(text);
  };

  const removeBlocks = () => {
    SetShowBlocks(false);
  };

  return (
    <div>
      <PaletteView
        openSubCategories={onClickCategory}
        showMenu={showMenu}
        removeSubCategory={removeSubCategory}
      />

      {showMenu ? (
        <SubCategoryView
          buttonList={buttonList[category.indexOf(selectedCategory)]}
          openblocks={onClickSubCategory}
        />
      ) : null}

      {showMenu && showBlocks ? (
        <BlockView
          blockList={blockList[selectedSubCategory]}
          showBlocks={showBlocks}
          removeBlocks={removeBlocks}
        />
      ) : null}
    </div>
  );
};

export default PaletteContoller;
