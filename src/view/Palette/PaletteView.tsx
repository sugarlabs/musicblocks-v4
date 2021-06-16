import React from "react";
import { State } from "../../types/State";
import "./PaletteView.scss";

const PaletteView: React.FC<{
  model: State;
  onCategoryClick: (text: string) => void;
  removeSubCategory: () => void;
}> = (props) => {
  const renderCategories = props.model.category.map((item, index) => (
    <button className="buttons" key={index} onClick={props.onCategoryClick.bind(null, item)}>
      {item}
    </button>
  ));

  return (
    <div className="container">
      {renderCategories}
      {props.model.showSubCategory ? (
        <button className="close" onClick={props.removeSubCategory}>
          Close
        </button>
      ) : null}
    </div>
  );
};

export default PaletteView;
