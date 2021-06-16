import React, { useReducer } from "react";
import { paletteModel } from "../models/Palette/PaletteModel";
import { Action, State } from "../types/State";
import BlockView from "../view/Palette/BlockView";
import PaletteView from "../view/Palette/PaletteView";
import SubCategoryView from "../view/Palette/SubCategoryView";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "showSubCategory":
      return { ...state, showSubCategory: true, selectedSubCategory: action.payload };
    case "hideSubCategory":
      return { ...state, showSubCategory: false, selectedSubCategory: "" };
    case "openSubCategory":
      return { ...state, showBlocks: true, selectedBlock: action.payload };
    case "removeBlocks":
      return { ...state, showBlocks: false, selectedBlock: "" };
    default:
      return state;
  }
};

const PaletteContoller: React.FC = () => {
  const [model, dispatch] = useReducer(reducer, paletteModel);

  const handleShowSubCategory = (text: string) => {
    dispatch({ type: "showSubCategory", payload: text });
  };

  const removeSubCategory = () => {
    dispatch({ type: "hideSubCategory" });
  };

  const onClickSubCategory = (text: string) => {
    dispatch({ type: "openSubCategory", payload: text });
  };

  const removeBlocks = () => {
    dispatch({ type: "removeBlocks" });
  };

  return (
    <div>
      <PaletteView
        model={model}
        onCategoryClick={handleShowSubCategory}
        removeSubCategory={removeSubCategory}
      />

      {model.showSubCategory ? (
        <SubCategoryView
          buttonList={model.subCategory[model.category.indexOf(model.selectedSubCategory)]}
          openblocks={onClickSubCategory}
        />
      ) : null}

      {model.showSubCategory && model.showBlocks ? (
        <BlockView blockList={model.blocks[model.selectedBlock]} removeBlocks={removeBlocks} />
      ) : null}
    </div>
  );
};

export default PaletteContoller;
