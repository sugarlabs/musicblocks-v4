import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ThemeToggle } from './ThemeToggle';
import { useThemeStore } from '../stores/theme';

describe('ThemeToggle', () => {
  beforeEach(() => {
    useThemeStore.setState({
      preference: 'system',
      resolvedTheme: 'light',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all three theme options with system selected by default', () => {
    render(<ThemeToggle />);

    const lightBtn = screen.getByRole('button', { name: 'Switch to light mode' });
    const darkBtn = screen.getByRole('button', { name: 'Switch to dark mode' });
    const systemBtn = screen.getByRole('button', { name: 'Switch to system theme' });

    expect(lightBtn).toBeTruthy();
    expect(darkBtn).toBeTruthy();
    expect(systemBtn).toBeTruthy();

    expect(lightBtn.getAttribute('aria-pressed')).toBe('false');
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');
    expect(systemBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('switches preference to light when light button is clicked', () => {
    render(<ThemeToggle />);

    const lightBtn = screen.getByRole('button', { name: 'Switch to light mode' });
    act(() => {
      fireEvent.click(lightBtn);
    });

    expect(useThemeStore.getState().preference).toBe('light');
    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('switches preference to dark when dark button is clicked', () => {
    render(<ThemeToggle />);

    const darkBtn = screen.getByRole('button', { name: 'Switch to dark mode' });
    act(() => {
      fireEvent.click(darkBtn);
    });

    expect(useThemeStore.getState().preference).toBe('dark');
    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('switches back to system when system button is clicked', () => {
    useThemeStore.setState({
      preference: 'dark',
      resolvedTheme: 'dark',
    });

    render(<ThemeToggle />);

    const systemBtn = screen.getByRole('button', { name: 'Switch to system theme' });
    act(() => {
      fireEvent.click(systemBtn);
    });

    expect(useThemeStore.getState().preference).toBe('system');
    expect(systemBtn.getAttribute('aria-pressed')).toBe('true');
  });
});
