import React from 'react';
import SImageVector from '../SImageVector/index';
//--stylesheet-----------------------------------------------------------------------------------
import './index.scss';

interface Props {
    size: 'big' | 'small';
    content: string;
    handlerClick: CallableFunction;
}

//--component definition-------------------------------------------------------------------------

const WIconButton: React.FC<Props> = ({ size, content, handlerClick }) => {
    return (
        <div
          className={`w-icon-button w-icon-button-${size}`}
          onClick={() => handlerClick()}
        >
            <SImageVector content={content} />
        </div>
    );
};

export default WIconButton;
