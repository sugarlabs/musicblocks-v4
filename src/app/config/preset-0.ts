import type { IAppConfig } from '@/@types/app';

export const appConfig: IAppConfig = {
    name: 'Production',
    desc: 'Production Configuration',
    env: {
        lang: 'en',
    },
    components: [
        {
            id: 'menu',
            flags: {
                uploadFile: false,
                recording: false,
                exportDrawing: false,
                loadProject: false,
                saveProject: false,
            },
        },
        'editor',
        {
            id: 'painter',
            elements: true,
        },
    ],
};

export default appConfig;
