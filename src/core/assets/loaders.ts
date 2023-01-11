import { TAsset, TAssetType } from '@/@types/core/assets';

/**
 * Stores the loader map.
 * @description A loader transforms the asset data from `base64` if required.
 */
const loaders: Partial<Record<TAssetType, (asset: TAsset) => Promise<TAsset>>> = {
    'image/svg+xml': async (asset: TAsset) => {
        return fetch(asset.data)
            .then((res) => res.text())
            .then((res) => ({ ...asset, data: res }));
    },
};

export default loaders;
