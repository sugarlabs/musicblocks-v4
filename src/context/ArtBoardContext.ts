import { createContext } from 'react';

// -- types ----------------------------------------------------------------------------------------

import { IArtBoardContext } from '../@types/context';
import { IArtboardModel } from '../../src/@types/artboard';

// -- defaults -------------------------------------------------------------------------------------

/**
 * Default values for the top-level configurations context.
 */
const ArtBoardList: IArtboardModel[] = [];

export const ContextDefaultArtBoard: IArtBoardContext = {
    artBoardList: ArtBoardList,
    setArtBoardList: (artBoardList) => artBoardList,
};

// -- instance -------------------------------------------------------------------------------------

export const ArtBoardContext = createContext<IArtBoardContext>(ContextDefaultArtBoard);
