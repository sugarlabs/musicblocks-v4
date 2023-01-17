import {
    TAsset,
    TAssetAudio,
    TAssetImage,
    TAssetKind,
    TAssetManifest,
    TAssetType,
} from '@/@types/core/assets';

import loaders from './loaders';

// -- private variables ----------------------------------------------------------------------------

/** Stores the asset map. */
const _assets: Partial<Record<TAssetKind, { [identifier: string]: TAsset }>> = {};

// -- private functions ----------------------------------------------------------------------------

/**
 * Stores an asset into the asset map (after transforming using the loader if present).
 * @param identifier string to uniquely identify the asset
 * @param asset asset item
 */
async function _loadAsset(identifier: string, asset: TAsset): Promise<void> {
    const kind = asset.type.split('/')[0] as TAssetKind;

    if (!(kind in _assets)) _assets[kind] = {};

    _assets[kind]![identifier] =
        asset.type in loaders ? await loaders[asset.type]!.call(null, asset) : asset;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns an audio asset item, if present.
 */
export function getAsset(kind: 'audio', identifier: string): TAssetAudio | undefined;
/**
 * Returns an image asset item, if present.
 */
export function getAsset(kind: 'image', identifier: string): TAssetImage | undefined;
export function getAsset(kind: TAssetKind, identifier: string): TAsset | undefined {
    return !(kind in _assets) ? undefined : _assets[kind]![identifier];
}

/**
 * Fetches an asset file and loads them into the repository.
 * @param identifier string to uniquely identify the asset
 * @param manifest asset details
 */
export async function importAsset(identifier: string, manifest: TAssetManifest): Promise<void> {
    let { path, meta } = manifest;
    path = path.replaceAll(/^(.?\/)/g, '');

    const data = await fetch(path)
        .then((response) => response.blob())
        .then((blob) => {
            return new Promise<string>((resolve, reject) => {
                try {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                } catch (e) {
                    reject(e);
                }
            });
        });

    await _loadAsset(identifier, {
        type: data.match(/data:(.+);base64/)![1] as TAssetType,
        data,
        meta: meta === undefined ? {} : {},
    });
}

/**
 * Fetches a list of asset files and loads them into the repository.
 * @param items asset items
 * @param callback callback function to call after each asset item is imported
 */
export async function importAssets(
    items: {
        /** String to uniquely identify the asset. */
        identifier: string;
        /** Asset details. */
        manifest: TAssetManifest;
    }[],
    callback: (assetId: string) => unknown,
): Promise<void> {
    await Promise.all(
        items.map(({ identifier, manifest }) =>
            importAsset(identifier, manifest).then(() => {
                callback(identifier);
            }),
        ),
    );
}
