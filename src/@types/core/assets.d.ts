/** Type definition for each asset item's manifest. */
export type TAssetManifest = {
    /** Path to the asset file relative to `src/assets/` */
    path: string;
    /** Metadata associated with the asset file. */
    meta?: {
        [key: string]: boolean | number | string;
    };
};

// -------------------------------------------------------------------------------------------------

/** Kind of asset. */
export type TAssetKind = 'audio' | 'image';

// -------------------------------------------------------------------------------------------------

/** File type of audio asset. */
export type TAssetTypeAudio = 'audio/mp3' | 'audio/ogg' | 'audio/wave';
/** File type of image asset. */
export type TAssetTypeImage = 'image/gif' | 'image/jpg' | 'image/png' | 'image/svg+xml';
/** File type of asset. */
export type TAssetType = TAssetTypeAudio | TAssetTypeImage;

// -------------------------------------------------------------------------------------------------

/** Type definition for an asset. */
export type TAsset = {
    /** File type of asset. */
    type: TAssetType;
    /** Asset data. */
    data: string;
} & Pick<TAssetManifest, 'meta'>;
/** Type definition for an audio asset. */
export type TAssetAudio = Pick<TAsset, 'data' | 'meta'> & { type: TAssetTypeAudio };
/** Type definition for an image asset. */
export type TAssetImage = Pick<TAsset, 'data' | 'meta'> & { type: TAssetTypeImage };
