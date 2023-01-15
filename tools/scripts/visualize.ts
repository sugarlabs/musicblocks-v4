import open from 'open';
import preview from './preview';

export default async function (root: string, config: string, port: number) {
    await preview(root, config, port);
    open(`http://localhost:${port}/stats.html`);
}
