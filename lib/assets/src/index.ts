import { TAsset, TAssetManifest, TAssetType } from '#/@types/assets';

import loaders from './loaders';

// -- private variables ----------------------------------------------------------------------------

/** Stores the asset map. */
const _assets: { [identifier: string]: TAsset } = {};

// -- private functions ----------------------------------------------------------------------------

/**
 * Stores an asset into the asset map (after transforming using the loader if present).
 * @param identifier string to uniquely identify the asset
 * @param asset asset item
 */
async function _loadAsset(identifier: string, asset: TAsset): Promise<void> {
    _assets[identifier] =
        asset.type in loaders ? await loaders[asset.type]!.call(null, asset) : asset;
}

// -- public functions -----------------------------------------------------------------------------

/**
 * Returns an asset entry.
 * @param identifier asset identifier
 */
export function getAsset(identifier: string): TAsset | undefined {
    return _assets[identifier];
}

/**
 * Returns map of asset entries corresponding to asset identifiers.
 * @param identifiers list of asset identifiers
 */
export function getAssets(identifiers: string[]): { [identifier: string]: TAsset | undefined } {
    return Object.fromEntries(identifiers.map((identifier) => [identifier, getAsset(identifier)]));
}

/**
 * Fetches an asset file and loads them into the repository.
 * @param identifier string to uniquely identify the asset
 * @param manifest asset details
 */
export async function importAsset(identifier: string, manifest: TAssetManifest): Promise<void> {
    let { path, meta } = manifest;
    path = import.meta.env.PROD
        ? path.replace(new RegExp(`${import.meta.env.BASE_URL}`), '')
        : path;

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
        meta: meta !== undefined ? meta : {},
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
    callback?: (assetId: string) => unknown,
): Promise<void> {
    await Promise.all(
        items.map(({ identifier, manifest }) =>
            importAsset(identifier, manifest).then(() => {
                if (callback !== undefined) callback(identifier);
            }),
        ),
    );
}
