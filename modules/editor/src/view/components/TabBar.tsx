import { useState } from 'react';
import type { JSX } from 'react';
import type { IEditorTab } from '../../@types/tabs';

interface ITabBarProps {
  tabs: IEditorTab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: () => void;
  onTabAddType?: (type: IEditorTab['type'], name?: string) => void;
}

/**
 * Checks if a tab name already exists
 */
function isNameDuplicate(tabs: IEditorTab[], name: string, type: IEditorTab['type']): boolean {
  // Build the expected label based on type (matching parent component logic)
  let expectedLabel: string;
  if (type === 'sprite') {
    expectedLabel = `Sprite: ${name}`;
  } else if (type === 'routine') {
    expectedLabel = `Routine: ${name}`;
  } else {
    expectedLabel = name;
  }

  // Check if any existing tab has this exact label (case-insensitive)
  const normalizedExpected = expectedLabel.toLowerCase().trim();
  return tabs.some((tab) => tab.label.toLowerCase().trim() === normalizedExpected);
}

/**
 * TabBar component for displaying and managing editor tabs
 */
export function TabBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabAdd,
  onTabAddType,
}: ITabBarProps): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);

  const handleAddTabType = (type: IEditorTab['type']) => {
    if (onTabAddType) {
      // Always prompt for name for all tab types
      const promptText =
        type === 'sprite'
          ? 'Enter sprite name:'
          : type === 'routine'
            ? 'Enter routine name:'
            : 'Enter tab name:';

      let name = prompt(promptText);

      // Only create tab if user provided a name
      if (name && name.trim()) {
        name = name.trim();

        // Check for duplicate names
        if (isNameDuplicate(tabs, name, type)) {
          alert(
            `A ${type} tab with the name "${name}" already exists. Please choose a different name.`,
          );
          setShowMenu(false);
          return;
        }

        onTabAddType(type, name);
      }
    }
    setShowMenu(false);
  };
  return (
    <div className="editor-tab-bar">
      <div className="editor-tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`editor-tab ${tab.id === activeTabId ? 'editor-tab-active' : ''} ${
              tab.isDirty ? 'editor-tab-dirty' : ''
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="editor-tab-icon">
              {tab.type === 'sprite' && '🎨'}
              {tab.type === 'routine' && '⚙️'}
              {tab.type === 'main' && '📄'}
            </span>
            <span className="editor-tab-label">{tab.label}</span>
            {tab.isDirty && <span className="editor-tab-dirty-indicator">●</span>}
            {tabs.length > 1 && (
              <button
                className="editor-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                title="Close tab"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="editor-tab-add-wrapper">
        <button
          className="editor-tab-add"
          onClick={() => setShowMenu(!showMenu)}
          title="Add new tab"
        >
          +
        </button>
        {showMenu && (
          <div className="editor-tab-add-menu">
            <button onClick={() => handleAddTabType('main')}>
              <span>📄</span> Main Program
            </button>
            <button onClick={() => handleAddTabType('sprite')}>
              <span>🎨</span> Sprite
            </button>
            <button onClick={() => handleAddTabType('routine')}>
              <span>⚙️</span> Routine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
