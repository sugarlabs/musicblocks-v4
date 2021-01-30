import { IBlockElement } from './structureElements';

export interface IStartBlock extends IBlockElement {}

export interface IActionBlock extends IBlockElement {}

export interface IAST {
    startBlocks: IStartBlock[];
    actionBlocks: IActionBlock[];
}
