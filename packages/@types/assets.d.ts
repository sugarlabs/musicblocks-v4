/** Type definition for each asset item's manifest. */
export type TAssetManifest = {
    /** Path to the asset file relative to `src/assets/` */
    path: string;
    /** Metadata associated with the asset file. */
    meta?: {
        [key: string]: boolean | number | string;
    };
};

/** File type of asset. */
export type TAssetType =
    | 'audio/mp3'
    | 'audio/ogg'
    | 'audio/wave'
    | 'image/gif'
    | 'image/jpg'
    | 'image/png'
    | 'image/svg+xml';

/** Type definition for an asset. */
export type TAsset = {
    /** File type of asset. */
    type: TAssetType;
    /** Asset data. */
    data: string;
} & Pick<TAssetManifest, 'meta'>;
