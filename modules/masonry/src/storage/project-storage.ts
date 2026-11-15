import type { ExportedProject } from '@/@types/import-export.types';

/** A stored project as a library lists it, without its payload. */
export interface ProjectMeta {
    id: string;
    name: string;
    /** Epoch milliseconds of the last save. */
    updatedAt: number;
    /** The payload's `version` at save time, so a newer-build record can be flagged unopened. */
    schemaVersion: number;
}

/**
 * Where workspace projects persist between sessions.
 *
 * Every method rejects with a {@link StorageError} when the backing store cannot be opened or is
 * full; other rejections are bugs. `load` also rejects with `NewerSchemaError` for a record from a
 * newer build (keep it) and a plain `Error` for one that fails migration or validation.
 */
export interface ProjectStorage {
    /** Creates or overwrites the project under `id`. */
    save(id: string, name: string, project: ExportedProject): Promise<void>;
    /** The migrated, validated project, or null when nothing is stored under `id`. */
    load(id: string): Promise<ExportedProject | null>;
    /** Every stored project, most recently saved first. */
    list(): Promise<ProjectMeta[]>;
    /** Removes the project under `id`; a missing id is not an error. */
    delete(id: string): Promise<void>;
}

/** `unavailable`: no storage at all (private mode, blocked, unsupported). `quota`: storage full. */
export type StorageFailure = 'unavailable' | 'quota';

/** Storage could not be used; callers fall back to manual export. */
export class StorageError extends Error {
    constructor(
        readonly reason: StorageFailure,
        message: string,
        options?: { cause?: unknown },
    ) {
        super(message, options);
        this.name = 'StorageError';
    }
}
