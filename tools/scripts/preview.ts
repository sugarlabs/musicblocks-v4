import { preview } from 'vite';

export default async function (root: string, config: string, port: number) {
    const server = await preview({
        root,
        configFile: config,

        preview: {
            port,
            host: true,
        },
    });

    server.printUrls();
}
