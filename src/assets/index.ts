import { TAssetManifest } from '@/@types/core/assets';

const manifest: {
    [identifier: string]: TAssetManifest;
} = {
    /*
     * please maintain alphabetical order for readability
     */

    'image.logo': {
        path: './image/logo.png',
    },
};

export default manifest;
