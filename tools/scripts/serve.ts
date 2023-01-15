import { createServer } from 'vite';

export default async function (root: string, config: string, port: number) {
    const server = await createServer({
        root,
        configFile: config,

        server: {
            port,
            host: true,
        },
    });

    await server.listen();

    server.printUrls();
}
