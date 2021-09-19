// -- types ----------------------------------------------------------------------------------------

import { TAppLanguage } from '../@types/config';

// -- utilities ------------------------------------------------------------------------------------

export function collectAppLanguages(): Promise<{ code: TAppLanguage; name: string }[]> {
    return new Promise((resolve) =>
        resolve([
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'हिंदी' },
            { code: 'pt', name: 'Português' },
        ]),
    );
}

export function collectBrickSizes(): Promise<{ value: number; label: string }[]> {
    return new Promise((resolve) =>
        resolve([
            { value: 1, label: 'small' },
            { value: 2, label: 'normal' },
            { value: 3, label: 'medium' },
            { value: 4, label: 'large' },
            { value: 5, label: 'very large' },
        ]),
    );
}
