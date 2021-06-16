import "./BlockView.scss";
const BlockView: React.FC<{ blockList: string[]; removeBlocks: () => void }> = (props) => {
  const dragToCanvas = () => {
    // console.log(`drag ${text} block to canvas`);
  };
  const renderBlocks =
    props.blockList != undefined
      ? props.blockList.map((item, index) => (
          <button key={index} className="block" onClick={dragToCanvas.bind(null, item)}>
            {item}
          </button>
        ))
      : null;

  const renderPopUp = (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.removeBlocks}>
          x
        </span>
        <div className="blockContainer">{renderBlocks}</div>
      </div>
    </div>
  );

  return <div>{props.blockList != undefined ? renderPopUp : null}</div>;
};

export default BlockView;
