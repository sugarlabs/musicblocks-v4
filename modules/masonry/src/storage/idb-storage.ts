import type { ExportedProject } from '@/@types/import-export.types';
import { migrateProject } from '@/utils/import-export';

import { StorageError, type ProjectMeta, type ProjectStorage } from './project-storage';

const DB_NAME = 'mb4-masonry';
const DB_VERSION = 1;
const STORE = 'projects';

interface ProjectRecord extends ProjectMeta {
    project: unknown;
}

/** Quota is the one request failure a user can act on; anything else is a bug and stays as is. */
function quotaOr(error: unknown): unknown {
    return error instanceof DOMException && error.name === 'QuotaExceededError'
        ? new StorageError('quota', 'Browser storage is full', { cause: error })
        : error;
}

/** {@link ProjectStorage} backed by IndexedDB: one `projects` store keyed by project id. */
export class IdbProjectStorage implements ProjectStorage {
    private db: Promise<IDBDatabase> | null = null;

    /** `factory` defaults to the global, read on first use: in a sandboxed iframe the read throws. */
    constructor(private readonly factory?: IDBFactory) {}

    async save(id: string, name: string, project: ExportedProject): Promise<void> {
        const record: ProjectRecord = {
            id,
            name,
            updatedAt: Date.now(),
            schemaVersion: project.version,
            project,
        };
        await this.run('readwrite', (store) => store.put(record));
    }

    async load(id: string): Promise<ExportedProject | null> {
        const record = (await this.run('readonly', (store) => store.get(id))) as
            | ProjectRecord
            | undefined;
        return record ? migrateProject(record.project) : null;
    }

    async list(): Promise<ProjectMeta[]> {
        // shortcut: getAll reads every payload just to list names; fine for classroom-sized
        // libraries, move metadata to its own store if listing gets slow.
        const records = (await this.run('readonly', (store) => store.getAll())) as ProjectRecord[];
        return records
            .map(({ id, name, updatedAt, schemaVersion }) => ({
                id,
                name,
                updatedAt,
                schemaVersion,
            }))
            .sort((a, b) => b.updatedAt - a.updatedAt);
    }

    async delete(id: string): Promise<void> {
        await this.run('readwrite', (store) => store.delete(id));
    }

    /**
     * Runs one request in its own transaction and resolves once the transaction commits. Every read
     * and write goes through here, so multi-tab safety has one place to land; note that one request
     * per transaction cannot express a read-then-write check, so that work must widen `body`.
     */
    private async run<T>(
        mode: IDBTransactionMode,
        body: (store: IDBObjectStore) => IDBRequest<T>,
    ): Promise<T> {
        const db = await this.open();
        return new Promise<T>((resolve, reject) => {
            try {
                const tx = db.transaction(STORE, mode);
                const request = body(tx.objectStore(STORE));
                tx.oncomplete = () => resolve(request.result);
                // Request errors bubble up and abort the transaction, so abort sees them all.
                tx.onabort = () =>
                    reject(quotaOr(tx.error ?? request.error ?? new Error('Transaction aborted')));
            } catch (error) {
                if (error instanceof DOMException && error.name === 'InvalidStateError') {
                    // The connection died without a close event: drop it so the next call reopens.
                    this.db = null;
                    reject(
                        new StorageError('unavailable', 'Lost the storage connection', {
                            cause: error,
                        }),
                    );
                } else {
                    reject(quotaOr(error));
                }
            }
        });
    }

    private open(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        const opening = new Promise<IDBDatabase>((resolve, reject) => {
            const factory = this.factory ?? globalThis.indexedDB;
            if (!factory) {
                throw new StorageError('unavailable', 'IndexedDB is not supported here');
            }
            const request = factory.open(DB_NAME, DB_VERSION);
            // One branch per DB_VERSION, so a later bump only adds what is new to old databases.
            request.onupgradeneeded = (event) => {
                if (event.oldVersion < 1) {
                    request.result.createObjectStore(STORE, { keyPath: 'id' });
                }
            };
            request.onsuccess = () => {
                const db = request.result;
                // Another tab is upgrading: close so we don't block it. This older build then
                // reports unavailable, since it cannot open the newer database.
                db.onversionchange = () => {
                    db.close();
                    this.db = null;
                };
                // The browser closed it (site data cleared, storage evicted): reopen on next use.
                db.onclose = () => {
                    this.db = null;
                };
                resolve(db);
            };
            request.onerror = () => reject(request.error);
        }).catch((error: unknown) => {
            this.db = null; // let the next call retry instead of caching the failure
            // A full disk is quota; any other failure to open (private mode, older build than the
            // database) means storage cannot be used here.
            const failure = quotaOr(error);
            throw failure instanceof StorageError
                ? failure
                : new StorageError('unavailable', 'Browser storage is not usable', {
                      cause: error,
                  });
        });

        this.db = opening;
        return opening;
    }
}
