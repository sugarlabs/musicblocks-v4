import './App.scss';
import Artboard from './components/artboard/Artboard';
import Builder from './components/builder/Builder';
import Menu from './components/menu/Menu';
import Palette from './components/palette/Palette';

export default function App(): JSX.Element {
  return (
    <div id="app">
      <Artboard />
      <Builder />
      <Menu />
      <Palette />
    </div>
  );
}
