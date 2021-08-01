import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IartBoard, IArtBoardContext } from '../@types/context';

// -- defaults -------------------------------------------------------------------------------------

/**
 * Default values for the top-level configurations context.
 */
const ArtBoardList: IartBoard = {
    artboardList: [],
};

export const ContextDefaultArtBoard: IArtBoardContext = {
    artBoardList: ArtBoardList,
    setArtBoardList: (artBoardList) => artBoardList,
};

// -- instance -------------------------------------------------------------------------------------

/**
 * Context instance for the top-level configurations.
 */
export const ArtBoardContext = createContext<IArtBoardContext>(ContextDefaultArtBoard);
