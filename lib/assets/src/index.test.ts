// @vitest-environment jsdom

import { afterEach, expect, it, vi } from 'vitest';

import { getAsset, importAsset } from './index';

const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
const inlineUrl = 'data:image/svg+xml,' + encodeURIComponent(svg);

afterEach(() => vi.unstubAllEnvs());

it.each([
    ['/', inlineUrl],
    ['/', '/assets/sprite.svg'],
    ['/musicblocks-v4/', '/musicblocks-v4/assets/sprite.svg'],
])('preserves asset URLs for base %s (%s)', async (base, url) => {
    vi.stubEnv('PROD', true);
    vi.stubEnv('BASE_URL', base);
    const originalFetch = globalThis.fetch;
    const assetFetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
        if (input !== url) return originalFetch(input);
        return {
            blob: async () => new Blob([svg], { type: 'image/svg+xml' }),
        } as Response;
    });

    try {
        await importAsset('sprite', { path: url });
        expect(assetFetch).toHaveBeenNthCalledWith(1, url);
        expect(getAsset('sprite')).toEqual({ type: 'image/svg+xml', data: svg, meta: {} });
    } finally {
        assetFetch.mockRestore();
    }
});
