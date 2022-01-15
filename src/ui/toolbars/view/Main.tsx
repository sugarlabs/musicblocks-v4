// -- components -----------------------------------------------------------------------------------

import ToolbarMainBtn from './ToolbarMainBtn';
import ToolbarAuxiliaryBox from './ToolbarAuxiliaryBox';

// -- stylesheet -----------------------------------------------------------------------------------

import './Main.scss';

// -- view component definition --------------------------------------------------------------------

/**
 * Returns the View component of the Toolbars component.
 */
export default function (): React.FunctionComponentElement<HTMLElement> {
  // -- render -------------------------------------------------------------------------------------

  return (
    <>
      <section id="toolbar-main" className="toolbar">
        <div id="toolbar-main-cluster-a" className="toolbar-cluster toolbar-main-cluster">
          <ToolbarMainBtn cssClasses="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-a-item"></ToolbarMainBtn>
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-a-item">
            A
          </div>
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-a-item">
            B
          </div>
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-a-item">
            C
          </div>
        </div>
        <div id="toolbar-main-cluster-b" className="toolbar-cluster toolbar-main-cluster">
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-b-item">
            A
          </div>
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-b-item">
            B
          </div>
          <div className="toolbar-cluster-item toolbar-main-cluster-item toolbar-main-cluster-b-item">
            C
          </div>
        </div>
      </section>
      <section id="toolbar-auxiliary" className="toolbar">
        <div id="toolbar-auxiliary-cluster-a" className="toolbar-cluster toolbar-auxiliary-cluster">
          <ToolbarAuxiliaryBox
            cssClasses={[
              'toolbar-cluster-item',
              'toolbar-auxiliary-cluster-item',
              'toolbar-auxiliary-cluster-a-item',
            ]}
            collapsible={true}
          ></ToolbarAuxiliaryBox>
        </div>
        <div id="toolbar-auxiliary-cluster-b" className="toolbar-cluster toolbar-auxiliary-cluster">
          <ToolbarAuxiliaryBox
            cssClasses={[
              'toolbar-cluster-item',
              'toolbar-auxiliary-cluster-item',
              'toolbar-auxiliary-cluster-b-item',
            ]}
            collapsible={true}
          ></ToolbarAuxiliaryBox>
          <ToolbarAuxiliaryBox
            cssClasses={[
              'toolbar-cluster-item',
              'toolbar-auxiliary-cluster-item',
              'toolbar-auxiliary-cluster-b-item',
            ]}
            collapsible={false}
          ></ToolbarAuxiliaryBox>
        </div>
      </section>
    </>
  );
}
