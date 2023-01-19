import { TAssetManifest } from '@/@types/core/assets';

// -------------------------------------------------------------------------------------------------

/*
 * please keep related items grouped together for better readability
 */

import imageLogo from './image/logo.png';

import imageIconBuild from './image/icon/build.svg';
import imageIconHelp from './image/icon/help.svg';
import imageIconPin from './image/icon/pin.svg';
import imageIconUnpin from './image/icon/unpin.svg';

import imageIconRun from './image/icon/run.svg';
import imageIconStop from './image/icon/stop.svg';
import imageIconReset from './image/icon/reset.svg';
import imageIconSaveProjectHTML from './image/icon/saveProjectHTML.svg';
import imageIconExportDrawing from './image/icon/exportDrawing.svg';
import imageIconStartRecording from './image/icon/startRecording.svg';
import imageIconStopRecording from './image/icon/stopRecording.svg';

import imageIconClose from './image/icon/close.svg';
import imageIconCode from './image/icon/code.svg';

import imageIconMouse from './image/icon/mouse.svg';

import audioGuitar from './audio/guitar.wav';
import audioPiano from './audio/piano.wav';
import audioSnare from './audio/snare.wav';

// -------------------------------------------------------------------------------------------------

const manifest: {
    [identifier: string]: TAssetManifest;
} = {
    /*
     * please follow same import grouping as above
     */

    'image.logo': {
        path: imageLogo,
    },

    'image.icon.build': {
        path: imageIconBuild,
    },
    'image.icon.help': {
        path: imageIconHelp,
    },
    'image.icon.pin': {
        path: imageIconPin,
    },
    'image.icon.unpin': {
        path: imageIconUnpin,
    },

    'image.icon.run': {
        path: imageIconRun,
    },
    'image.icon.stop': {
        path: imageIconStop,
    },
    'image.icon.reset': {
        path: imageIconReset,
    },
    'image.icon.saveProjectHTML': {
        path: imageIconSaveProjectHTML,
    },
    'image.icon.exportDrawing': {
        path: imageIconExportDrawing,
    },
    'image.icon.startRecording': {
        path: imageIconStartRecording,
    },
    'image.icon.stopRecording': {
        path: imageIconStopRecording,
    },

    'image.icon.close': {
        path: imageIconClose,
    },
    'image.icon.code': {
        path: imageIconCode,
    },

    'image.icon.mouse': {
        path: imageIconMouse,
    },

    'audio.guitar': {
        path: audioGuitar,
        meta: {
            name: 'guitar',
            category: 'strings',
            tonal: true,
            centerNote: 'c4',
            defaultVolume: 50,
        },
    },
    'audio.piano': {
        path: audioPiano,
        meta: {
            name: 'piano',
            category: 'percussion',
            tonal: true,
            centerNote: 'c4',
            defaultVolume: 100,
        },
    },
    'audio.snare': {
        path: audioSnare,
        meta: {
            name: 'snare',
            category: 'percussion',
            tonal: false,
            centerNote: 'c3',
            defaultVolume: 50,
        },
    },
};

export default manifest;
