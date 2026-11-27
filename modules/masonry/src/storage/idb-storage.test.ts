import { forceCloseDatabase, IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ExportedProject } from '@/@types/import-export.types';
import type { TowerState } from '@/@types/workspace.types';
import { statementTreeWithNesting } from '@/mocks/tower';
import {
    EXPORT_SCHEMA_VERSION,
    exportWorkspace,
    importProject,
    NewerSchemaError,
} from '@/utils/import-export';

import { IdbProjectStorage } from './idb-storage';
import { StorageError } from './project-storage';

function project(): ExportedProject {
    const towers: Record<string, TowerState> = {
        't-1': { id: 't-1', root: statementTreeWithNesting, position: { x: 10, y: 20 } },
    };
    return exportWorkspace(towers);
}

/** A fresh, empty database per test. */
const freshStorage = () => new IdbProjectStorage(new IDBFactory());

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

describe('IdbProjectStorage', () => {
    it('round-trips a workspace through save, load and import', async () => {
        const storage = freshStorage();
        const saved = project();

        await storage.save('p-1', 'My song', saved);
        const loaded = await storage.load('p-1');

        expect(loaded).toEqual(saved);
        expect(Object.keys(importProject(loaded, 'preserve'))).toEqual(['t-1']);
    });

    it('returns null for an id that was never saved', async () => {
        expect(await freshStorage().load('missing')).toBeNull();
    });

    it('overwrites on save and lists newest first', async () => {
        const storage = freshStorage();
        const now = vi.spyOn(Date, 'now');

        // Key order is a, b; recency is b, a, so only the sort can produce this result.
        now.mockReturnValue(1000);
        await storage.save('b', 'First', project());
        now.mockReturnValue(2000);
        await storage.save('a', 'Second', project());
        now.mockReturnValue(3000);
        await storage.save('b', 'First, renamed', project());

        expect(await storage.list()).toEqual([
            {
                id: 'b',
                name: 'First, renamed',
                updatedAt: 3000,
                schemaVersion: EXPORT_SCHEMA_VERSION,
            },
            { id: 'a', name: 'Second', updatedAt: 2000, schemaVersion: EXPORT_SCHEMA_VERSION },
        ]);
    });

    it('deletes, and ignores ids that do not exist', async () => {
        const storage = freshStorage();
        await storage.save('a', 'A', project());

        await storage.delete('a');
        await storage.delete('never-there');

        expect(await storage.list()).toEqual([]);
        expect(await storage.load('a')).toBeNull();
    });

    it('rejects a corrupt record on load instead of returning it', async () => {
        const storage = freshStorage();
        await storage.save('bad', 'Bad', { version: EXPORT_SCHEMA_VERSION } as ExportedProject);

        await expect(storage.load('bad')).rejects.toThrow(/no nodes/);
    });

    it('keeps a record from a newer build and reports its version', async () => {
        const storage = freshStorage();
        const newer = { ...project(), version: EXPORT_SCHEMA_VERSION + 1 };
        await storage.save('next', 'Next', newer);

        await expect(storage.load('next')).rejects.toBeInstanceOf(NewerSchemaError);
        await expect(storage.load('next')).rejects.toMatchObject({ version: newer.version });
        expect(await storage.list()).toHaveLength(1);
    });

    it('passes a non-storage failure through instead of calling storage unavailable', async () => {
        const uncloneable = { ...project(), extra: () => 1 } as ExportedProject;

        await expect(freshStorage().save('a', 'A', uncloneable)).rejects.toMatchObject({
            name: 'DataCloneError',
        });
    });

    it('reports unavailable when IndexedDB does not exist', async () => {
        vi.stubGlobal('indexedDB', undefined);

        await expect(new IdbProjectStorage().list()).rejects.toMatchObject({
            name: 'StorageError',
            reason: 'unavailable',
            message: 'IndexedDB is not supported here',
        });
    });

    it('reports unavailable when opening is refused, and retries on the next call', async () => {
        const factory = new IDBFactory();
        const open = vi.spyOn(factory, 'open').mockImplementationOnce(() => {
            throw new DOMException('denied', 'SecurityError');
        });
        const storage = new IdbProjectStorage(factory);

        await expect(storage.list()).rejects.toMatchObject({ reason: 'unavailable' });
        expect(await storage.list()).toEqual([]);
        expect(open).toHaveBeenCalledTimes(2);
    });

    it('reports quota when opening hits a full disk, and retries on the next call', async () => {
        const factory = new IDBFactory();
        const open = vi.spyOn(factory, 'open').mockImplementationOnce(() => {
            throw new DOMException('full', 'QuotaExceededError');
        });
        const storage = new IdbProjectStorage(factory);

        await expect(storage.list()).rejects.toMatchObject({
            name: 'StorageError',
            reason: 'quota',
        });
        expect(await storage.list()).toEqual([]);
        expect(open).toHaveBeenCalledTimes(2);
    });

    it('reports quota when put throws it', async () => {
        vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError');
        });

        const error = await freshStorage()
            .save('a', 'A', project())
            .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(StorageError);
        expect(error).toMatchObject({ reason: 'quota' });
    });

    it('reports quota when the transaction aborts with it, as browsers do', async () => {
        const quota = new DOMException('full', 'QuotaExceededError');
        const put = IDBObjectStore.prototype.put;
        vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
            this: IDBObjectStore,
            ...args: Parameters<IDBObjectStore['put']>
        ) {
            const request = put.apply(this, args);
            Object.defineProperty(this.transaction, 'error', { get: () => quota, set() {} });
            this.transaction.abort();
            return request;
        });

        await expect(freshStorage().save('a', 'A', project())).rejects.toMatchObject({
            name: 'StorageError',
            reason: 'quota',
        });
    });

    it('reports unavailable when even reading the global throws, as in a sandboxed iframe', async () => {
        vi.stubGlobal('indexedDB', undefined);
        Object.defineProperty(globalThis, 'indexedDB', {
            configurable: true,
            get() {
                throw new DOMException('sandboxed', 'SecurityError');
            },
        });

        const storage = new IdbProjectStorage();

        await expect(storage.list()).rejects.toMatchObject({ reason: 'unavailable' });
    });

    it('reopens after the browser closes the connection', async () => {
        const factory = new IDBFactory();
        const open = vi.spyOn(factory, 'open');
        const storage = new IdbProjectStorage(factory);
        await storage.save('a', 'A', project());

        forceCloseDatabase(open.mock.results[0].value.result);
        await storage.save('b', 'B', project());

        expect((await storage.list()).map(({ id }) => id).sort()).toEqual(['a', 'b']);
        expect(open).toHaveBeenCalledTimes(2);
    });

    it('reports unavailable and reopens when the connection died without a close event', async () => {
        const factory = new IDBFactory();
        const open = vi.spyOn(factory, 'open');
        const storage = new IdbProjectStorage(factory);
        await storage.save('a', 'A', project());

        const db: IDBDatabase = open.mock.results[0].value.result;
        db.close(); // a script-initiated close fires no close event, like a silent loss

        await expect(storage.save('b', 'B', project())).rejects.toMatchObject({
            name: 'StorageError',
            reason: 'unavailable',
        });
        await storage.save('b', 'B', project());
        expect(open).toHaveBeenCalledTimes(2);
    });

    it('steps aside when another tab upgrades the database', async () => {
        const factory = new IDBFactory();
        const storage = new IdbProjectStorage(factory);
        await storage.save('a', 'A', project());

        const upgrade = factory.open('mb4-masonry', 2);
        const outcome = await new Promise<string>((resolve) => {
            upgrade.onsuccess = () => resolve('opened');
            upgrade.onblocked = () => resolve('blocked');
        });
        expect(outcome).toBe('opened');

        upgrade.result.close();
        // This build is now older than the database, so it cannot use it.
        await expect(storage.list()).rejects.toMatchObject({
            reason: 'unavailable',
            cause: { name: 'VersionError' },
        });
    });
});
