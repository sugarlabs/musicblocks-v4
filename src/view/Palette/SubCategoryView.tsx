import React from "react";
import "./SubCategoryView.scss";

const SubCategoryView: React.FC<{ buttonList: string[]; openblocks: (text: string) => void }> = (
  props
) => {
  return (
    <div className="subCategoryContainer">
      {props.buttonList != undefined
        ? props.buttonList.map((item, index) => (
            <button className="subCategory" key={index} onClick={props.openblocks.bind(null, item)}>
              {item}
            </button>
          ))
        : null}
    </div>
  );
};

export default SubCategoryView;
