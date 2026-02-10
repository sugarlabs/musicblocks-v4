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
    { id: 'boolean', label: 'Boolean', icon: '', color: '#D98A42' },
    { id: 'heap', label: 'Heap', icon: '', color: '#D98A42' },
    { id: 'dictionary', label: 'Dictionary', icon: '', color: '#D98A42' },
    { id: 'extras', label: 'Extras', icon: '', color: '#C4C4C4' },
    { id: 'program', label: 'Program', icon: '', color: '#C4C4C4' },
];

const graphicsCategories: CategoryConfig[] = [
    { id: 'graphics', label: 'Graphics', icon: '', color: '#FF6B6B' },
    { id: 'pen', label: 'Pen', icon: '', color: '#4ECDC4' },
    { id: 'media', label: 'Media', icon: '', color: '#FFD166' },
    { id: 'sensors', label: 'Sensors', icon: '', color: '#6A0572' },
    { id: 'ensemble', label: 'Ensemble', icon: '', color: '#1A936F' },
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

/**
 * Determines which mode a category belongs to based on its ID.
 * @param categoryId - The category ID to check
 * @returns The mode the category belongs to, or null if not found
 */
export function getCategoryMode(categoryId: string): PaletteMode | null {
    const lowerCaseId = categoryId.toLowerCase();
    
    // Check if the category exists in any of the mode's categories
    if (musicCategories.some(cat => cat.id.toLowerCase() === lowerCaseId)) {
        return 'music';
    }
    if (flowCategories.some(cat => cat.id.toLowerCase() === lowerCaseId)) {
        return 'flow';
    }
    if (graphicsCategories.some(cat => cat.id.toLowerCase() === lowerCaseId)) {
        return 'graphics';
    }
    
    return null;
}

export const defaultCategories = musicCategories;

