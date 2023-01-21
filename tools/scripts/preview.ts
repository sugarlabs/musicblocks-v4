import { preview } from 'vite';

export default async function (root: string, config: string, port: number, base?: string) {
    const server = await preview({
        root,
        configFile: config,
        base,

        preview: {
            port,
            host: true,
        },
    });

    server.printUrls();
}
