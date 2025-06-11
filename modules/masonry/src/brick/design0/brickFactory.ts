import { v4 as uuidv4 } from 'uuid';
import type { TColor } from '@/@types/brick';
import BrickStatement from './BrickStatement';
import BrickExpression from './BrickExpression';
import BrickData from './BrickData';
import BrickBlock from './BrickBlock';

// Warehouse to manage brick instances
const brickWarehouse: Map<string, BrickStatement | BrickExpression | BrickData | BrickBlock> =
    new Map();

/**
 * Adds a brick instance to the warehouse.
 * @param brick - The brick instance to add.
 */
function addBrickToWarehouse(
    brick: BrickStatement | BrickExpression | BrickData | BrickBlock,
): void {
    brickWarehouse.set(brick.uuid, brick);
}

/**
 * Retrieves a brick instance from the warehouse by its ID.
 * @param id - The ID of the brick to retrieve.
 * @returns The brick instance if found, otherwise undefined.
 */
function getBrickFromWarehouse(
    id: string,
): BrickStatement | BrickExpression | BrickData | BrickBlock | undefined {
    return brickWarehouse.get(id);
}

/**
 * Deletes a brick instance from the warehouse by its ID.
 * @param id - The ID of the brick to delete.
 * @returns True if the brick was deleted, false if it was not found.
 */
function deleteBrickFromWarehouse(id: string): boolean {
    return brickWarehouse.delete(id);
}

/**
 * Converts a Record type args to an array.
 * @param argsRecord - Record of args objects.
 * @returns Converted args as an array.
 */
function argsRecordToArray(
    argsRecord: Record<string, { label: string; dataType: string; meta: unknown }>,
): { id: string; label: string }[] {
    return Object.entries(argsRecord).map(([id, { label }]) => ({ id, label }));
}

/**
 * Factory function to create a new BrickBlock instance.
 * @param params - Parameters to initialize the BrickBlock.
 * @returns A new instance of BrickBlock.
 */
export function createBrickBlock(params: {
    name: string;
    label: string;
    glyph?: string;
    args: { id: string; label: string }[];
    colorBg: TColor;
    colorFg: TColor;
    colorBgHighlight: TColor;
    colorFgHighlight: TColor;
    outline: TColor;
    scale: number;
    connectAbove: boolean;
    connectBelow: boolean;
    nestLengthY: number;
    folded?: boolean;
}): BrickBlock {
    const brick = new BrickBlock({
        uuid: uuidv4(),
        ...params,
    });
    addBrickToWarehouse(brick);
    return brick;
}

/**
 * Factory function to create a new BrickData instance.
 * @param params - Parameters to initialize the BrickData.
 * @returns A new instance of BrickData.
 */
export function createBrickData(params: {
    name: string;
    label: string;
    glyph: string;
    dynamic: boolean;
    value?: boolean | number | string;
    input?: 'boolean' | 'number' | 'string' | 'options';
    colorBg: TColor;
    colorFg: TColor;
    colorBgHighlight: TColor;
    colorFgHighlight: TColor;
    outline: TColor;
    scale: number;
}): BrickData {
    const brick = new BrickData({
        uuid: uuidv4(),
        ...params,
    });
    addBrickToWarehouse(brick);
    return brick;
}

/**
 * Factory function to create a new BrickExpression instance.
 * @param params - Parameters to initialize the BrickExpression.
 * @returns A new instance of BrickExpression.
 */
export function createBrickExpression(params: {
    name: string;
    label: string;
    glyph: string;
    args: Record<string, { label: string; dataType: string; meta: unknown }>;
    colorBg: TColor;
    colorFg: TColor;
    colorBgHighlight: TColor;
    colorFgHighlight: TColor;
    outline: TColor;
    scale: number;
}): BrickExpression {
    const brick = new BrickExpression({
        uuid: uuidv4(),
        ...params,
        args: argsRecordToArray(params.args), // Convert Record to array
    });
    addBrickToWarehouse(brick);
    return brick;
}

/**
 * Factory function to create a new BrickStatement instance.
 * @param params - Parameters to initialize the BrickStatement.
 * @returns A new instance of BrickStatement.
 */
export function createBrickStatement(params: {
    name: string;
    label: string;
    glyph: string;
    args: Record<string, { label: string; dataType: string; meta: unknown }>;
    colorBg: TColor;
    colorFg: TColor;
    colorBgHighlight: TColor;
    colorFgHighlight: TColor;
    outline: TColor;
    scale: number;
    connectAbove: boolean;
    connectBelow: boolean;
}): BrickStatement {
    const brick = new BrickStatement({
        uuid: uuidv4(),
        ...params,
        args: argsRecordToArray(params.args),
    });
    addBrickToWarehouse(brick);
    return brick;
}

// Exporting warehouse functions for external use
export { addBrickToWarehouse, getBrickFromWarehouse, deleteBrickFromWarehouse };
