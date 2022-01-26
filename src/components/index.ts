import { mount } from './painter/painter';

const root = document.getElementById('root')!;

const artboardContainer = document.createElement('div');
artboardContainer.id = 'artboards';
root.appendChild(artboardContainer);
mount(artboardContainer);
