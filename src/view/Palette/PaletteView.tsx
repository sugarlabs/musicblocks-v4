import React from "react";
import { category } from "../../dummyEngine";
import "./PaletteView.scss";

const PaletteView: React.FC<{
  openSubCategories: (text: string) => void;
  showMenu: boolean;
  removeSubCategory: () => void;
}> = (props) => {
  const renderCategories = category.map((item, index) => (
    <button className="buttons" key={index} onClick={props.openSubCategories.bind(null, item)}>
      {item}
    </button>
  ));

  return (
    <div className="container">
      {renderCategories}
      {props.showMenu ? (
        <button className="close" onClick={props.removeSubCategory}>
          Close
        </button>
      ) : null}
    </div>
  );
};

export default PaletteView;
