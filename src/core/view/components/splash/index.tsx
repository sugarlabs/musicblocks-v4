import React from 'react';
import './index.scss';

// -- component definition -------------------------------------------------------------------------

export default function Splash({ progress }: { progress: number }): JSX.Element {
    return (
        <div className="splash-container" id="splash">
            <img className="splash-logo" src="/logo.png" alt="Logo" />
            <div className="splash-progress-bar">
                <div className="splash-progress" style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
