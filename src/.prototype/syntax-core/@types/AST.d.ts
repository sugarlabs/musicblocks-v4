import { IBlockElement } from './structureElements';

export interface IStartBlock extends IBlockElement {}

export interface IActionBlock extends IBlockElement {}

export interface IAST {
    /** Returns list of 'start' elements. */
    startBlocks: IStartBlock[];
    /** Returns list of 'action' elements. */
    actionBlocks: IActionBlock[];
    /** Creates a new 'start' element and add it to 'start' blocks list. */
    addStart: Function;
    /** Removes a 'start' element from 'start' blocks list. */
    removeStart: Function;
}
