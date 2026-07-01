import {
    Box,
    GitBranch,
    Music,
    Palette,
    Play,
    Repeat,
    Shapes,
    Waves,
    type LucideIcon,
} from 'lucide-react';

/**
 * Maps the string icon identifiers used in `PaletteConfig` (category/section `icon` fields) to
 * concrete lucide-react components. Config carries icon names as plain strings, so both the category
 * rail and the section list resolve them through this shared lookup to avoid drift.
 */
const iconMap: Record<string, LucideIcon> = {
    Music,
    Waves,
    GitBranch,
    Shapes,
    Play,
    Repeat,
    Palette,
    Box,
};

/** Resolves an icon name from the config to a lucide component, falling back to `Box`. */
export function resolveIcon(name: string): LucideIcon {
    return iconMap[name] ?? Box;
}
