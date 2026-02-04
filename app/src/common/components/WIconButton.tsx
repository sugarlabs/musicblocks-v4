import React from "react";

type Props = {
  size?: "big" | "small";
  asset: string;
  handlerClick: () => void;
};

const WIconButton = ({
  size = "small",
  asset,
  handlerClick,
}: Props) => {
  return (
    <button className={`w-icon-button ${size}`} onClick={handlerClick}>
      {/* TODO: Replace img with SImage once SImage PR is merged */}
      <img src={asset} />
    </button>
  );
};

export default WIconButton;
