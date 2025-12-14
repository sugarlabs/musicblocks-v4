import type { JSX } from 'react';
import type { ITabManagerState } from '../../@types/tabs';

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { injected } from '../..';
import { TabBar } from './TabBar';
import {
  createDefaultTabState,
  createTab,
  addTab,
  removeTab,
  updateTabContent,
  setActiveTab,
  getActiveTab,
  updateTabBuildStatus,
} from '../../core/tabManager';

// -- stylesheet -----------------------------------------------------------------------------------

import './index.scss';

// -- private variables ----------------------------------------------------------------------------

let _editor: HTMLDivElement;
let _codeBox: HTMLTextAreaElement;
let _btnHelp: HTMLButtonElement;
let _status: HTMLParagraphElement;
let _btnBuild: HTMLButtonElement;
let _btnClose: HTMLButtonElement;
let _helpBox: HTMLTextAreaElement;

let _mountedCallback: CallableFunction;
let _setTabState: React.Dispatch<React.SetStateAction<ITabManagerState>>;

// -- component definition -------------------------------------------------------------------------

/**
 * Editor component.
 * @returns root JSX element of the Editor component
 */
function Editor(): JSX.Element {
  const codeBoxRef = useRef(null);
  const btnHelpRef = useRef(null);
  const statusRef = useRef(null);
  const btnBuildRef = useRef(null);
  const btnCloseRef = useRef(null);
  const helpBoxRef = useRef(null);

  const [showingHelp, setShowingHelp] = useState(false);
  const [tabState, setTabState] = useState<ITabManagerState>(createDefaultTabState());

  // Store setTabState for external access
  _setTabState = setTabState;

  const activeTab = getActiveTab(tabState);

  useEffect(() => {
    _codeBox = codeBoxRef.current!;
    _btnHelp = btnHelpRef.current!;
    _status = statusRef.current!;
    _btnBuild = btnBuildRef.current!;
    _btnClose = btnCloseRef.current!;
    _helpBox = helpBoxRef.current!;

    _mountedCallback();

    _editor.addEventListener('resetstates', () => {
      setShowingHelp(false);
    });

    (
      [
        ['image.icon.help', _btnHelp],
        ['image.icon.build', _btnBuild],
        ['image.icon.close', _btnClose],
      ] as [string, HTMLButtonElement][]
    ).forEach(([assetId, button]) => {
      // @ts-ignore
      button.innerHTML = injected.assets[assetId].data;
    });
  }, []);

  // Update textarea content and status when active tab changes
  useEffect(() => {
    if (activeTab && _codeBox) {
      _codeBox.value = activeTab.content;
      // Restore the build status for this tab
      _status.innerHTML = activeTab.buildStatus || '';
    }
  }, [activeTab?.id]);

  const handleTabSelect = (tabId: string) => {
    // Save current tab content before switching
    if (activeTab) {
      setTabState((prevState) => updateTabContent(prevState, activeTab.id, _codeBox.value));
    }
    setTabState((prevState) => setActiveTab(prevState, tabId));
  };

  const handleTabClose = (tabId: string) => {
    // Save current tab content before closing (in case it's not the one being closed)
    if (activeTab && activeTab.id !== tabId) {
      setTabState((prevState) => updateTabContent(prevState, activeTab.id, _codeBox.value));
    }
    setTabState((prevState) => removeTab(prevState, tabId));
  };

  const handleTabAdd = () => {
    // Save current tab content before creating new tab
    if (activeTab) {
      setTabState((prevState) => updateTabContent(prevState, activeTab.id, _codeBox.value));
    }
    const newTab = createTab(`Tab ${tabState.tabs.length + 1}`, 'main');
    setTabState((prevState) => addTab(prevState, newTab, true));
  };

  const handleCodeInput = () => {
    if (activeTab) {
      // Clear build status when code is modified
      _status.innerHTML = '';
      setTabState((prevState) => {
        let newState = updateTabContent(prevState, activeTab.id, _codeBox.value);
        newState = updateTabBuildStatus(newState, activeTab.id, '');
        return newState;
      });
    }
  };

  return (
    <>
      <TabBar
        tabs={tabState.tabs}
        activeTabId={tabState.activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onTabAdd={handleTabAdd}
        onTabAddType={(type, name) => {
          // Save current tab content before creating new tab
          if (activeTab) {
            setTabState((prevState) => updateTabContent(prevState, activeTab.id, _codeBox.value));
          }

          // Name is now always provided and required
          let label = name!;
          if (type === 'sprite') {
            label = `Sprite: ${name}`;
          } else if (type === 'routine') {
            label = `Routine: ${name}`;
          }

          const newTab = createTab(label, type, '', {
            spriteId: type === 'sprite' ? `sprite-${Date.now()}` : undefined,
            routineName: type === 'routine' ? name : undefined,
          });
          setTabState((prevState) => addTab(prevState, newTab, true));
        }}
      />
      <div className={`editor-wrapper ${showingHelp ? 'editor-wrapper-hidden' : ''}`}>
        <textarea id="editor-codebox" ref={codeBoxRef} onInput={handleCodeInput}></textarea>
        <div id="editor-console">
          <button
            id="editor-btn-help"
            ref={btnHelpRef}
            onClick={() => setShowingHelp(true)}
          ></button>
          <div id="editor-status-wrapper">
            <p id="editor-status" ref={statusRef}></p>
          </div>
          <button
            id="editor-btn-build"
            ref={btnBuildRef}
            onClick={() =>
              _editor.dispatchEvent(
                new CustomEvent<string>('buildprogram', {
                  detail: _codeBox.value,
                }),
              )
            }
          ></button>
        </div>
      </div>
      <div className={`editor-wrapper ${!showingHelp ? 'editor-wrapper-hidden' : ''}`}>
        <textarea id="editor-help" ref={helpBoxRef} readOnly></textarea>
        <button
          id="editor-help-close"
          ref={btnCloseRef}
          onClick={() => setShowingHelp(false)}
        ></button>
      </div>
    </>
  );
}

/**
 * Mounts the React component inside the DOM container.
 * @param container DOM container
 * @returns a `Promise` of an object containing the DOM artboard and interactor elements
 */
export function setup(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    _editor = container as HTMLDivElement;
    _editor.id = 'editor';

    const rootContainer = createRoot(container);
    rootContainer.render(<Editor />);

    _mountedCallback = () => requestAnimationFrame(() => resolve());
  });
}

/**
 * Sets the text code content of the codebox.
 * @param text text code content
 */
export function setCode(text: string): void {
  _codeBox.value = text;
}

/**
 * Sets the text content of the status box.
 * @param text text content
 */
export function setStatus(text: string): void {
  _status.innerHTML = text;
  // Also save the status in the active tab's state
  if (_setTabState) {
    _setTabState((prevState) => {
      const activeTab = getActiveTab(prevState);
      if (activeTab) {
        return updateTabBuildStatus(prevState, activeTab.id, text);
      }
      return prevState;
    });
  }
}

/**
 * Sets the text content of the help box.
 * @param text text content
 */
export function setHelp(text: string): void {
  _helpBox.innerHTML = text;
}

/**
 * Resets the component states.
 */
export function resetStates(): void {
  _editor.dispatchEvent(new Event('resetstates'));
}

/**
 * Adds a new tab to the editor
 * @param label Label for the tab
 * @param type Type of tab ('main', 'sprite', or 'routine')
 * @param content Initial content for the tab
 * @param options Additional options (spriteId, routineName)
 */
export function addNewTab(
  label: string,
  type: 'main' | 'sprite' | 'routine' = 'main',
  content: string = '',
  options?: { spriteId?: string; routineName?: string },
): void {
  const newTab = createTab(label, type, content, options);
  _setTabState((prevState) => addTab(prevState, newTab, true));
}

/**
 * Gets the content of the currently active tab
 */
export function getCurrentTabContent(): string {
  return _codeBox.value;
}

/**
 * Gets all tabs
 */
export function getAllTabs(): ITabManagerState['tabs'] {
  // This will be populated through state, but we need a way to access it
  // For now, return empty array as we need to manage state externally
  return [];
}

/**
 * Switches to a tab by its ID
 */
export function switchToTab(tabId: string): void {
  _setTabState((prevState) => setActiveTab(prevState, tabId));
}
