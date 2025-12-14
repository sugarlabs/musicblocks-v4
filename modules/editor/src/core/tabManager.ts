import type { IEditorTab, ITabManagerState } from '../@types/tabs';

/**
 * Utility functions for managing editor tabs
 */

let _tabCounter = 0;

// Generates a unique tab ID
export function generateTabId(): string {
    return `tab-${Date.now()}-${_tabCounter++}`;
}

// Creates a new tab with default values
export function createTab(
    label: string,
    type: IEditorTab['type'] = 'main',
    content: string = '',
    options?: {
        spriteId?: string;
        routineName?: string;
    },
): IEditorTab {
    return {
        id: generateTabId(),
        label,
        type,
        content,
        isDirty: false,
        buildStatus: '',
        spriteId: options?.spriteId,
        routineName: options?.routineName,
    };
}

// Creates default tab manager state with a single main tab
export function createDefaultTabState(): ITabManagerState {
    const mainTab = createTab('Main', 'main');
    return {
        tabs: [mainTab],
        activeTabId: mainTab.id,
    };
}

// Adds a new tab to the state
export function addTab(
    state: ITabManagerState,
    tab: IEditorTab,
    makeActive: boolean = true,
): ITabManagerState {
    return {
        tabs: [...state.tabs, tab],
        activeTabId: makeActive ? tab.id : state.activeTabId,
    };
}

// Removes a tab from the state
export function removeTab(state: ITabManagerState, tabId: string): ITabManagerState {
    const tabs = state.tabs.filter((tab) => tab.id !== tabId);

    // If we removed the active tab, select another one
    let activeTabId = state.activeTabId;
    if (activeTabId === tabId && tabs.length > 0) {
        const removedIndex = state.tabs.findIndex((tab) => tab.id === tabId);
        // Select the previous tab or the next one if it was the first
        activeTabId = tabs[Math.max(0, removedIndex - 1)].id;
    }

    return {
        tabs,
        activeTabId,
    };
}

// Updates a tab's content and marks it as dirty

export function updateTabContent(
    state: ITabManagerState,
    tabId: string,
    content: string,
): ITabManagerState {
    return {
        ...state,
        tabs: state.tabs.map((tab) =>
            tab.id === tabId ? { ...tab, content, isDirty: true } : tab,
        ),
    };
}

// Marks a tab as saved (not dirty)
export function markTabSaved(state: ITabManagerState, tabId: string): ITabManagerState {
    return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, isDirty: false } : tab)),
    };
}

// Sets the active tab
export function setActiveTab(state: ITabManagerState, tabId: string): ITabManagerState {
    return {
        ...state,
        activeTabId: tabId,
    };
}

// Gets the currently active tab
export function getActiveTab(state: ITabManagerState): IEditorTab | undefined {
    return state.tabs.find((tab) => tab.id === state.activeTabId);
}

// Updates a tab's label
export function updateTabLabel(
    state: ITabManagerState,
    tabId: string,
    label: string,
): ITabManagerState {
    return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, label } : tab)),
    };
}

// Gets all tabs for a specific sprite
export function getTabsBySprite(state: ITabManagerState, spriteId: string): IEditorTab[] {
    return state.tabs.filter((tab) => tab.spriteId === spriteId);
}

// Gets all routine tabs
export function getRoutineTabs(state: ITabManagerState): IEditorTab[] {
    return state.tabs.filter((tab) => tab.type === 'routine');
}

// Gets all routine tabs
export function getSpriteTabs(state: ITabManagerState): IEditorTab[] {
    return state.tabs.filter((tab) => tab.type === 'sprite');
}

// Updates the build status of a specific tab
export function updateTabBuildStatus(
    state: ITabManagerState,
    tabId: string,
    status: string,
): ITabManagerState {
    return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, buildStatus: status } : tab)),
    };
}
