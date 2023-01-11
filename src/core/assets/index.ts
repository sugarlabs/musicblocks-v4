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

    const data = (await import(`../../assets/${path}`)).default as string;

    await _loadAsset(identifier, {
        type: data.match(/data:(.+);base64/)![1] as TAssetType,
        data,
        meta,
    });
}

/**
 * Fetches a list of asset files and loads them into the repository.
 * @param items asset items
 */
export async function importAssets(
    items: {
        /** String to uniquely identify the asset. */
        identifier: string;
        /** Asset details. */
        manifest: TAssetManifest;
    }[],
): Promise<void> {
    await Promise.all(items.map(({ identifier, manifest }) => importAsset(identifier, manifest)));
}
