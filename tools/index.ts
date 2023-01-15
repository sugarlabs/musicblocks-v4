#!node_modules/.bin/ts-node

import path from 'path';

import build from './scripts/build';
import preview from './scripts/preview';
import serve from './scripts/serve';
import visualize from './scripts/visualize';

type TCommand = 'build' | 'preview' | 'serve' | 'visualize';

function invoke(command: 'build', base: string): void;
function invoke(command: 'preview', port: number): void;
function invoke(command: 'serve', port: number): void;
function invoke(command: 'visualize', port: number): void;
function invoke(command: TCommand, ...args: (string | number)[]): void {
    const commands = {
        build,
        preview,
        serve,
        visualize,
    };

    const root = path.resolve(__dirname, '..');
    const config = path.resolve(__dirname, './vite.config.ts');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    commands[command].call(null, root, config, ...args);
}

// -------------------------------------------------------------------------------------------------

import process from 'process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

yargs(hideBin(process.argv))
    .strict()
    .command(
        'build',
        'build project for production',
        (yargs) =>
            yargs.option('base', {
                alias: 'b',
                type: 'string',
                description: 'Base URL',
                default: '/',
            }),
        (yargs) => invoke('build', yargs.base),
    )
    .command(
        'preview',
        "serve production build (run 'build' prior to this)",
        (yargs) =>
            yargs.option('port', {
                alias: 'p',
                type: 'number',
                description: 'Port to serve on',
                default: 4173,
            }),
        (yargs) => invoke('preview', yargs.port),
    )
    .command(
        'serve',
        'start the development server',
        (yargs) =>
            yargs.option('port', {
                alias: 'p',
                type: 'number',
                description: 'Port to serve on',
                default: 5173,
            }),
        (yargs) => invoke('serve', yargs.port),
    )
    .command(
        'visualize',
        'visualize module sizes in build',
        (yargs) =>
            yargs.option('port', {
                alias: 'p',
                type: 'number',
                description: 'Port to serve on',
                default: 4173,
            }),
        (yargs) => invoke('visualize', yargs.port),
    )
    .parse();
