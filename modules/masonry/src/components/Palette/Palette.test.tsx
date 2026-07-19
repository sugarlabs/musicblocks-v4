// Component test for the Brick Palette shell. Renders into jsdom via React Testing Library and
// asserts on behavior grouped by the maintainer's UI-test checklist: rendering, interaction, state,
// accessibility, and edge cases.
//
// Scope note: jsdom does no layout and does not implement scrollIntoView, so scroll-to is asserted
// by spying on Element.prototype.scrollIntoView rather than checking real scroll position.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BrickViewProps } from '@/@types/brick.types';
import type {
  PaletteBrickConfig,
  PaletteCategoryConfig,
  PaletteClassificationConfig,
  PaletteConfig,
} from '@/@types/palette.types';

import { Palette } from './Palette';

afterEach(cleanup);

beforeEach(() => {
  // jsdom doesn't implement scrollIntoView; stub it so scroll-to can be asserted.
  Element.prototype.scrollIntoView = vi.fn();
});

// -------------------------------------------------------------------------------------------------
// Fixtures & helpers
// -------------------------------------------------------------------------------------------------

/** Deterministic stub for the icon component slot; renders a plain, identifiable span. */
const StubIcon = (props: { className?: string; style?: React.CSSProperties }) => (
  <span data-testid="stub-icon" {...props} />
);

// BrickSlot renders a live brick preview from `brick`, so each fixture needs a valid
// BrickViewProps config. The label text mirrors the entry name so name-based queries
// (getByText) resolve to the rendered SVG label.
const brickProps = (name: string): BrickViewProps => ({
  kind: 'statement',
  widget: { type: 'label', text: name },
  colorsDefault: { background: '#e07a5f', foreground: '#ffffff', border: '#00000033' },
  tooltipText: name,
});

/** Builds a single palette brick entry. */
const entry = (id: string, name: string, description: string): PaletteBrickConfig => ({
  id,
  name,
  description,
  brick: brickProps(name),
});

/** Builds a category with an accent color and the given bricks. */
const category = (name: string, bricks: PaletteBrickConfig[]): PaletteCategoryConfig => ({
  name,
  icon: StubIcon,
  color: '#123456',
  bricks,
});

/** Builds a classification with the given categories. */
const classification = (
  name: string,
  categories: PaletteCategoryConfig[],
): PaletteClassificationConfig => ({
  name,
  icon: StubIcon,
  categories,
});

/** Base fixture: two classifications (Music active by default, Logic). */
const config: PaletteConfig = {
  classifications: [
    classification('Music', [
      category('Rhythm', [entry('r1', 'Note', 'play a note'), entry('r2', 'Rest', 'a silence')]),
      category('Meter', [entry('m1', 'Beat', 'one beat')]),
    ]),
    classification('Logic', [category('Flow', [entry('f1', 'Repeat', 'loop a block')])]),
  ],
};

/** No classifications at all. */
const configEmpty: PaletteConfig = { classifications: [] };

/** A single classification that has no categories. */
const configNoCategories: PaletteConfig = {
  classifications: [classification('Empty', [])],
};

/** A single active classification with one populated and one empty category. */
const configWithEmptyCategory: PaletteConfig = {
  classifications: [
    classification('Music', [
      category('Full', [entry('r1', 'Note', 'play a note')]),
      category('Barren', []),
    ]),
  ],
};

/** Exactly one classification. */
const configSingle: PaletteConfig = {
  classifications: [
    classification('Music', [
      category('Rhythm', [entry('r1', 'Note', 'play a note'), entry('r2', 'Rest', 'a silence')]),
      category('Meter', [entry('m1', 'Beat', 'one beat')]),
    ]),
  ],
};

/** Types into the search input. */
const search = (value: string) =>
  fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value } });

// -------------------------------------------------------------------------------------------------

describe('Palette', () => {
  describe('rendering', () => {
    it('renders one classification tab per classification', () => {
      render(<Palette config={config} />);

      expect(screen.getByRole('button', { name: 'Music' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Logic' })).toBeTruthy();
      // Only the two classification tabs match; category buttons are named Rhythm/Meter.
      expect(screen.getAllByRole('button', { name: /^(Music|Logic)$/ })).toHaveLength(2);
    });

    it('renders each classification tab with an sr-only name and a matching title attribute', () => {
      render(<Palette config={config} />);

      const musicTab = screen.getByRole('button', { name: 'Music' });
      expect(musicTab.getAttribute('title')).toBe('Music');
      // The accessible name is driven by the sr-only span, not visible text.
      expect(within(musicTab).getByText('Music')).toBeTruthy();
      // The icon stub is present inside the tab.
      expect(within(musicTab).getByTestId('stub-icon')).toBeTruthy();
    });

    it('renders the search input with placeholder "Search"', () => {
      render(<Palette config={config} />);

      const input = screen.getByPlaceholderText('Search');
      expect(input.nodeName).toBe('INPUT');
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('renders a sidebar button for each category of the active classification', () => {
      render(<Palette config={config} />);

      // Music is active by default; disambiguated from same-named headings via role='button'.
      expect(screen.getByRole('button', { name: 'Rhythm' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Meter' })).toBeTruthy();
    });

    it('applies the balanced Palette density and scoped button states', () => {
      const { container } = render(<Palette config={config} />);

      const root = container.firstElementChild;
      const sidebar = screen.getByRole('navigation');
      const categoryButton = screen.getByRole('button', { name: 'Rhythm' });
      const inactiveTab = screen.getByRole('button', { name: 'Logic' });

      expect(root?.classList.contains('font-sans')).toBe(true);
      expect(root?.classList.contains('text-xs')).toBe(true);
      expect(root?.classList.contains('border-border')).toBe(true);
      expect(sidebar.classList.contains('w-18')).toBe(true);
      expect(sidebar.classList.contains('px-1')).toBe(true);
      expect(sidebar.classList.contains('border-border')).toBe(true);
      expect(categoryButton.classList.contains('text-xs')).toBe(true);
      expect(categoryButton.classList.contains('active:not-aria-[haspopup]:translate-y-0')).toBe(
        true,
      );
      expect(inactiveTab.classList.contains('hover:bg-muted/60')).toBe(true);
      expect(inactiveTab.classList.contains('active:not-aria-[haspopup]:translate-y-0')).toBe(true);
    });

    it('renders a section heading (h3) for each active-classification category', () => {
      render(<Palette config={config} />);

      const rhythm = screen.getByRole('heading', { name: 'Rhythm' });
      const meter = screen.getByRole('heading', { name: 'Meter' });
      expect(rhythm.nodeName).toBe('H3');
      expect(meter.nodeName).toBe('H3');
    });

    it('renders a BrickSlot per brick with its name, description title, and data-brick-id', () => {
      const { container } = render(<Palette config={config} />);

      const note = container.querySelector('[data-brick-id="r1"]');
      const rest = container.querySelector('[data-brick-id="r2"]');
      const beat = container.querySelector('[data-brick-id="m1"]');

      expect(note).not.toBeNull();
      expect(note?.getAttribute('title')).toBe('play a note');
      expect(note?.textContent).toContain('Note');

      expect(rest).not.toBeNull();
      expect(rest?.textContent).toContain('Rest');

      expect(beat).not.toBeNull();
      expect(beat?.textContent).toContain('Beat');
    });

    it('marks each brick slot as a palette drag source', () => {
      const { container } = render(<Palette config={config} />);

      const note = container.querySelector('[data-brick-id="r1"]');

      // The class is the delegated interact.js selector bound by useDragFromPalette, and
      // touch-action must be disabled so touch drags reach interact.js instead of scrolling.
      expect(note?.classList.contains('palette-brick-slot')).toBe(true);
      expect(note?.classList.contains('touch-none')).toBe(true);
      expect(note?.classList.contains('px-1')).toBe(false);
      expect(note?.classList.contains('py-1')).toBe(true);
      // Every slot carries the markup, not just the first.
      expect(container.querySelectorAll('.palette-brick-slot')).toHaveLength(3);
    });

    it('renders no empty-state message when bricks are present', () => {
      render(<Palette config={config} />);

      expect(screen.queryByText('No bricks match your search.')).toBeNull();
    });

    it('renders only the active (index 0) classification categories and bricks, hiding the others', () => {
      render(<Palette config={config} />);

      // Music content present.
      expect(screen.getByRole('heading', { name: 'Meter' })).toBeTruthy();
      expect(screen.getByText('Note')).toBeTruthy();
      expect(screen.getByText('Beat')).toBeTruthy();
      // Logic content absent.
      expect(screen.queryByRole('heading', { name: 'Flow' })).toBeNull();
      expect(screen.queryByText('Repeat')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Flow' })).toBeNull();
    });
  });

  describe('interaction', () => {
    it('switches the visible categories when another classification tab is clicked', () => {
      render(<Palette config={config} />);

      fireEvent.click(screen.getByRole('button', { name: 'Logic' }));

      expect(screen.getByRole('heading', { name: 'Flow' })).toBeTruthy();
      expect(screen.getByText('Repeat')).toBeTruthy();
      // Music content gone.
      expect(screen.queryByText('Note')).toBeNull();
      expect(screen.queryByRole('heading', { name: 'Rhythm' })).toBeNull();
    });

    it('scrolls a category into view when its sidebar button is clicked', () => {
      render(<Palette config={config} />);

      fireEvent.click(screen.getByRole('button', { name: 'Meter' }));

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('filters bricks as the user types in the search input', () => {
      render(<Palette config={config} />);

      search('note');

      expect(screen.getByText('Note')).toBeTruthy();
      expect(screen.queryByText('Rest')).toBeNull();
      // "Meter" has no matching brick, so it is dropped from list and sidebar.
      expect(screen.queryByRole('heading', { name: 'Meter' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Meter' })).toBeNull();
    });

    it('restores all bricks when the search query is cleared', () => {
      render(<Palette config={config} />);

      search('note');
      expect(screen.queryByText('Rest')).toBeNull();

      search('');
      expect(screen.getByText('Rest')).toBeTruthy();
      expect(screen.getByText('Beat')).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Meter' })).toBeTruthy();
      expect(screen.queryByText('No bricks match your search.')).toBeNull();
    });

    it('keeps within a kept category only the matching bricks', () => {
      render(<Palette config={config} />);

      search('note');

      // Rhythm survives (Note matches) but its sibling Rest is filtered out.
      expect(screen.getByRole('heading', { name: 'Rhythm' })).toBeTruthy();
      expect(screen.getByText('Note')).toBeTruthy();
      expect(screen.queryByText('Rest')).toBeNull();
    });
  });

  describe('state', () => {
    it('hides a category with no matching bricks from both the sidebar and the main list', () => {
      render(<Palette config={config} />);

      search('note');

      expect(screen.queryByRole('button', { name: 'Meter' })).toBeNull();
      expect(screen.queryByRole('heading', { name: 'Meter' })).toBeNull();
    });

    it('shows the empty-state message and no sections when nothing matches the query', () => {
      render(<Palette config={config} />);

      search('zzzzz');

      expect(screen.getByText('No bricks match your search.')).toBeTruthy();
      expect(screen.queryByRole('heading')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Rhythm' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Meter' })).toBeNull();
    });

    it('resets the search query to empty when a classification is selected', () => {
      render(<Palette config={config} />);

      search('note');
      fireEvent.click(screen.getByRole('button', { name: 'Logic' }));
      expect((screen.getByPlaceholderText('Search') as HTMLInputElement).value).toBe('');

      fireEvent.click(screen.getByRole('button', { name: 'Music' }));
      expect((screen.getByPlaceholderText('Search') as HTMLInputElement).value).toBe('');
      // The query was reset, not just the view: all Music bricks are back.
      expect(screen.getByText('Note')).toBeTruthy();
      expect(screen.getByText('Rest')).toBeTruthy();
      expect(screen.getByText('Beat')).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Meter' })).toBeTruthy();
    });

    it('swaps aria-pressed between tabs when the active classification changes', () => {
      render(<Palette config={config} />);

      expect(screen.getByRole('button', { name: 'Music' }).getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect(screen.getByRole('button', { name: 'Logic' }).getAttribute('aria-pressed')).toBe(
        'false',
      );

      fireEvent.click(screen.getByRole('button', { name: 'Logic' }));

      expect(screen.getByRole('button', { name: 'Logic' }).getAttribute('aria-pressed')).toBe(
        'true',
      );
      expect(screen.getByRole('button', { name: 'Music' }).getAttribute('aria-pressed')).toBe(
        'false',
      );
    });
  });

  describe('accessibility', () => {
    it('exposes each classification tab as a button with its name as the accessible name', () => {
      render(<Palette config={config} />);

      // Accessible name derives from the sr-only span even though visible content is only an icon.
      expect(screen.getByRole('button', { name: 'Music' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Logic' })).toBeTruthy();
    });

    it('marks the active tab with aria-pressed=true and inactive tabs with aria-pressed=false', () => {
      render(<Palette config={config} />);

      expect(screen.getByRole('button', { name: 'Music', pressed: true })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Logic', pressed: false })).toBeTruthy();
    });

    it('exposes each sidebar category as a button named by its category name', () => {
      render(<Palette config={config} />);

      // The visible span provides the name; distinct from the same-named headings.
      expect(screen.getByRole('button', { name: 'Rhythm' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Meter' })).toBeTruthy();
    });

    it('exposes each category section header as an h3 heading with the category name', () => {
      render(<Palette config={config} />);

      expect(screen.getByRole('heading', { level: 3, name: 'Rhythm' })).toBeTruthy();
      expect(screen.getByRole('heading', { level: 3, name: 'Meter' })).toBeTruthy();
    });

    it('exposes the search field as a textbox reachable by its placeholder', () => {
      render(<Palette config={config} />);

      const byPlaceholder = screen.getByPlaceholderText('Search');
      expect(screen.getByRole('textbox')).toBe(byPlaceholder);
    });

    it("exposes each brick's description via a title tooltip on its slot", () => {
      const { container } = render(<Palette config={config} />);

      expect(container.querySelector('[data-brick-id="r1"]')?.getAttribute('title')).toBe(
        'play a note',
      );
      expect(screen.getByTitle('a silence').getAttribute('data-brick-id')).toBe('r2');
    });
  });

  describe('edge cases', () => {
    it('renders the empty-state message and no tabs for an empty config', () => {
      expect(() => render(<Palette config={configEmpty} />)).not.toThrow();

      expect(screen.getByText('No bricks match your search.')).toBeTruthy();
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      expect(screen.queryByRole('heading')).toBeNull();
    });

    it('renders the empty state for an active classification that has no categories', () => {
      render(<Palette config={configNoCategories} />);

      // The tab renders...
      expect(screen.getByRole('button', { name: 'Empty' })).toBeTruthy();
      // ...but there are no sidebar category buttons or headings, just the empty state.
      expect(screen.getByText('No bricks match your search.')).toBeTruthy();
      expect(screen.queryByRole('heading')).toBeNull();
    });

    it('always hides a category that has zero bricks, even with no search query', () => {
      render(<Palette config={configWithEmptyCategory} />);

      // The populated category shows as sidebar button + heading.
      expect(screen.getByRole('button', { name: 'Full' })).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Full' })).toBeTruthy();
      // The empty category is absent from both sidebar and main list.
      expect(screen.queryByRole('button', { name: 'Barren' })).toBeNull();
      expect(screen.queryByRole('heading', { name: 'Barren' })).toBeNull();
    });

    it('trims surrounding whitespace from the search query before matching', () => {
      render(<Palette config={config} />);

      search('   note   ');

      expect(screen.getByText('Note')).toBeTruthy();
      // Behaves identically to the untrimmed query: Meter is hidden.
      expect(screen.queryByRole('heading', { name: 'Meter' })).toBeNull();
    });

    it('matches the search query case-insensitively', () => {
      render(<Palette config={config} />);

      search('NOTE');
      expect(screen.getByText('Note')).toBeTruthy();

      search('nOtE');
      expect(screen.getByText('Note')).toBeTruthy();
    });

    it("matches the search query against a brick's description, not only its name", () => {
      render(<Palette config={config} />);

      // "silence" appears only in Rest's description ('a silence').
      search('silence');

      expect(screen.getByText('Rest')).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Rhythm' })).toBeTruthy();
      // Bricks whose name/description lack the term are hidden.
      expect(screen.queryByText('Note')).toBeNull();
      expect(screen.queryByText('Beat')).toBeNull();
    });

    it('does not throw and keeps the active index valid for a single-classification config', () => {
      expect(() => render(<Palette config={configSingle} />)).not.toThrow();

      // The only classification renders as active by default.
      expect(screen.getByRole('button', { name: 'Music', pressed: true })).toBeTruthy();
      expect(screen.getByText('Note')).toBeTruthy();
      expect(screen.getByRole('heading', { name: 'Rhythm' })).toBeTruthy();
    });
  });
});
