// -- model component -------------------------------------------------------------------------------
import IArtboardManagerModel from '../../models/artboard/ArtboardManager';
const _ArtboardManagerModel = new IArtboardManagerModel();
import IArtboardModel from '../../models/artboard/Artboard';
import { useEffect, useState } from 'react';
import Artboard from './Artboard';
// -- view-model component definition --------------------------------------------------------------

/**
 * ViewModel of the ArtboardManager Framework component.
 */
export default function (): JSX.Element {
  const [artboardList, setartboardList] = useState([] as IArtboardModel[]);

  const addArtboard = (id: number) => {
    const newArtboard = new IArtboardModel(id);
    _ArtboardManagerModel.addArtboard(newArtboard);
    setartboardList(artboardList.concat(newArtboard));
  };

  const getArtboards = () => {
    return _ArtboardManagerModel.getArtboards();
  };

  useEffect(() => {
    addArtboard(3);
  }, []);
  return (
    <>
      <div id="artboard-manager-wrapper">
        {artboardList.map((board) => (
          <Artboard board={board} />
        ))}
      </div>
    </>
  );
}
