/**
 * Tab types and interfaces for multi-tab editor support
 */

// Type of tab content - sprite code, routine code, or main program
export type TTabType = 'main' | 'sprite' | 'routine';

// Tab data structure
export interface IEditorTab {
    // Unique identifier for the tab
    id: string;
    // Display label for the tab
    label: string;
    // Type of tab content
    type: TTabType;
    // Code content of the tab
    content: string;
    // Whether the tab has unsaved changes
    isDirty: boolean;
    // Build status message for this tab
    buildStatus: string;
    // Associated sprite ID (if type is 'sprite' or 'routine')
    spriteId?: string;
    // Associated routine name (if type is 'routine')
    routineName?: string;
}

/**
 * Tab manager state
 */
export interface ITabManagerState {
    // List of all tabs
    tabs: IEditorTab[];
    // ID of currently active tab
    activeTabId: string;
}
