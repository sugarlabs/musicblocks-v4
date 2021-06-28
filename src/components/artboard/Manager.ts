// -- model component -------------------------------------------------------------------------------
import IArtboardManagerModel from './../../models/artboard/ArtboardManager';
const _ArtboardManagerModel = new IArtboardManagerModel();
import IArtboardModel from './../../models/artboard/Artboard';
import { useState } from 'react';
import Artboard from './../../models/artboard/Artboard';
// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the ArtboardManager Framework component.
 */
export default function () {
    const [artboardList, setartboardList] = useState([] as IArtboardModel[]);
    const addArtboard = (id: number) => {
        const newArtboard = new IArtboardModel();
        _ArtboardManagerModel.addArtboard(newArtboard);
    };

    const getArtboards = () => {
        return _ArtboardManagerModel.getArtboards();
    };
}
