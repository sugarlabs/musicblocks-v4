import { TFeatureFlagMenu } from '@/@types/components/menu';

import { createItem } from '@/core/view';

import { setup as setupComponent } from './components';

// import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _btnUploadFileInLocalStorage: HTMLInputElement;
let _btnStartRecording: HTMLButtonElement;
let _btnStopRecording: HTMLButtonElement;
let _btnExportDrawing: HTMLButtonElement;
let _btnLoadProject: HTMLInputElement;
let _btnSaveProject: HTMLButtonElement;
let _btnRun: HTMLButtonElement;
let _btnStop: HTMLButtonElement;
let _btnReset: HTMLButtonElement;

// -- public functions -----------------------------------------------------------------------------

/**
 * Sets up the DOM.
 */
export function setup(utils: { flags: TFeatureFlagMenu }): Promise<void> {
    return new Promise((resolve) => {
        const menu = createItem({
            location: 'toolbar',
            type: 'container',
            position: 'cluster-b',
        });
        menu.id = 'menu';

        setupComponent(
            menu,
            {
                labels: {
                    uploadFileInLocalStorage: 'Upload a file',
                    startRecording: 'Start animation Recording',
                    stopRecording: 'Stop animation Recording',
                    exportDrawing: 'Save mouse artwork as PNG',
                    loadProject: 'Load Project',
                    saveProject: 'Save project as HTML',
                },
            },
            utils,
        ).then(
            ({
                btnUploadFileInLocalStorage,
                btnStartRecording,
                btnStopRecording,
                btnExportDrawing,
                btnLoadProject,
                btnSaveProject,
                btnRun,
                btnReset,
                btnStop,
            }) => {
                [
                    _btnUploadFileInLocalStorage,
                    _btnStartRecording,
                    _btnStopRecording,
                    _btnExportDrawing,
                    _btnLoadProject,
                    _btnSaveProject,
                    _btnRun,
                    _btnStop,
                    _btnReset,
                ] = [
                    btnUploadFileInLocalStorage,
                    btnStartRecording,
                    btnStopRecording,
                    btnExportDrawing,
                    btnLoadProject,
                    btnSaveProject,
                    btnRun,
                    btnStop,
                    btnReset,
                ];
                resolve();
            },
        );
    });
}

/**
 * @returns DOM `uploadFileInLocalStorage` `startRecording` `stopRecording` `exportDrawing`,`loadProject`,`saveProject`,`run`, `stop`, and `reset` buttons
 */
export function getButtons(): {
    uploadFileInLocalStorage: HTMLInputElement;
    startRecording: HTMLButtonElement;
    stopRecording: HTMLButtonElement;
    exportDrawing: HTMLButtonElement;
    loadProject: HTMLInputElement;
    saveProject: HTMLButtonElement;
    run: HTMLButtonElement;
    stop: HTMLButtonElement;
    reset: HTMLButtonElement;
} {
    return {
        uploadFileInLocalStorage: _btnUploadFileInLocalStorage,
        startRecording: _btnStartRecording,
        stopRecording: _btnStopRecording,
        exportDrawing: _btnExportDrawing,
        loadProject: _btnLoadProject,
        saveProject: _btnSaveProject,
        run: _btnRun,
        stop: _btnStop,
        reset: _btnReset,
    };
}

export { updateState } from './components';
