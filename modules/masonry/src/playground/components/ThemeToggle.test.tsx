import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThemeStore } from '../stores/theme';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');

    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    useThemeStore.setState({
      preference: 'system',
      resolvedTheme: 'light',
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('style');
  });

  it('renders all three theme options (light, dark, system)', () => {
    render(<ThemeToggle />);

    const group = screen.getByRole('group', { name: /theme mode/i });
    expect(group).toBeTruthy();

    const lightButton = screen.getByRole('button', { name: /switch to light mode/i });
    const darkButton = screen.getByRole('button', { name: /switch to dark mode/i });
    const systemButton = screen.getByRole('button', { name: /switch to system mode/i });

    expect(lightButton).toBeTruthy();
    expect(darkButton).toBeTruthy();
    expect(systemButton).toBeTruthy();

    expect(lightButton.getAttribute('title')).toBe('Light Mode');
    expect(darkButton.getAttribute('title')).toBe('Dark Mode');
    expect(systemButton.getAttribute('title')).toBe('System Mode');
  });

  it('defaults to system mode with aria-pressed="true" on system button', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /switch to light mode/i });
    const darkButton = screen.getByRole('button', { name: /switch to dark mode/i });
    const systemButton = screen.getByRole('button', { name: /switch to system mode/i });

    expect(systemButton.getAttribute('aria-pressed')).toBe('true');
    expect(lightButton.getAttribute('aria-pressed')).toBe('false');
    expect(darkButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to light mode when light button is clicked', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /switch to light mode/i });
    const darkButton = screen.getByRole('button', { name: /switch to dark mode/i });
    const systemButton = screen.getByRole('button', { name: /switch to system mode/i });

    fireEvent.click(lightButton);

    expect(useThemeStore.getState().preference).toBe('light');
    expect(lightButton.getAttribute('aria-pressed')).toBe('true');
    expect(darkButton.getAttribute('aria-pressed')).toBe('false');
    expect(systemButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to dark mode when dark button is clicked', () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /switch to light mode/i });
    const darkButton = screen.getByRole('button', { name: /switch to dark mode/i });
    const systemButton = screen.getByRole('button', { name: /switch to system mode/i });

    fireEvent.click(darkButton);

    expect(useThemeStore.getState().preference).toBe('dark');
    expect(darkButton.getAttribute('aria-pressed')).toBe('true');
    expect(lightButton.getAttribute('aria-pressed')).toBe('false');
    expect(systemButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches back to system mode when system button is clicked', () => {
    useThemeStore.setState({
      preference: 'dark',
      resolvedTheme: 'dark',
    });

    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /switch to light mode/i });
    const darkButton = screen.getByRole('button', { name: /switch to dark mode/i });
    const systemButton = screen.getByRole('button', { name: /switch to system mode/i });

    expect(darkButton.getAttribute('aria-pressed')).toBe('true');
    expect(systemButton.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(systemButton);

    expect(useThemeStore.getState().preference).toBe('system');
    expect(systemButton.getAttribute('aria-pressed')).toBe('true');
    expect(lightButton.getAttribute('aria-pressed')).toBe('false');
    expect(darkButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('applies custom className to the container', () => {
    const { container } = render(<ThemeToggle className="custom-theme-class" />);
    expect(container.firstElementChild?.classList.contains('custom-theme-class')).toBe(true);
  });
});
