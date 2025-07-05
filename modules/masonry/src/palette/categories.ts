import { ReactNode } from 'react';

export interface CategoryConfig {
    id: string;
    label: string;
    icon: ReactNode;
    color: string;
}

export type PaletteMode = 'music' | 'flow' | 'graphics';

const musicCategories: CategoryConfig[] = [
    { id: 'rhythm', label: 'Rhythm', icon: '', color: '#FF8700' },
    { id: 'meter', label: 'Meter', icon: '', color: '#FE994F' },
    { id: 'pitch', label: 'Pitch', icon: '', color: '#7CD622' },
    { id: 'intervals', label: 'Intervals', icon: '', color: '#7CD622' },
    { id: 'tone', label: 'Tone', icon: '', color: '#7CD622' },
    { id: 'ornament', label: 'Ornament', icon: '', color: '#3DDCDD' },
    { id: 'volume', label: 'Volume', icon: '', color: '#3DDCDD' },
    { id: 'drum', label: 'Drum', icon: '', color: '#3DDCDD' },
    { id: 'widgets', label: 'Widgets', icon: '', color: '#7CD622' },
];

const flowCategories: CategoryConfig[] = [
    { id: 'flow', label: 'Flow', icon: '', color: '#FF8700' },
    { id: 'action', label: 'Action', icon: '', color: '#FE994F' },
    { id: 'boxes', label: 'Boxes', icon: '', color: '#7CD622' },
    { id: 'number', label: 'Number', icon: '', color: '#3DDCDD' },
    { id: 'boolean', label: 'Boolean', icon: '', color: '#7CD622' },
];

const graphicsCategories: CategoryConfig[] = [
    { id: 'graphics', label: 'Graphics', icon: '🖼️', color: '#FF6B6B' },
    { id: 'pen', label: 'Pen', icon: '✏️', color: '#4ECDC4' },
    { id: 'media', label: 'Media', icon: '🎬', color: '#FFD166' },
    { id: 'sensors', label: 'Sensors', icon: '📡', color: '#6A0572' },
    { id: 'ensemble', label: 'Ensemble', icon: '👥', color: '#1A936F' },
];

export function getCategories(mode: PaletteMode): CategoryConfig[] {
    switch (mode) {
        case 'music':
            return musicCategories;
        case 'flow':
            return flowCategories;
        case 'graphics':
            return graphicsCategories;
        default:
            return [];
    }
}

export const defaultCategories = musicCategories;
