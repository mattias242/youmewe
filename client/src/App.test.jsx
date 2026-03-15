import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from './App';

vi.mock('./components/CreatorFlow', () => ({
  default: () => <div>MockCreator</div>,
}));
vi.mock('./components/JoinFlow', () => ({
  default: ({ joinCode }) => <div>MockJoin:{joinCode}</div>,
}));

describe('App', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('renders CreatorFlow when no join param', () => {
    render(<App />);
    expect(screen.getByText('MockCreator')).toBeInTheDocument();
  });

  it('renders JoinFlow with code when join param present', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?join=ABC123' },
      writable: true,
    });
    render(<App />);
    expect(screen.getByText('MockJoin:ABC123')).toBeInTheDocument();
  });
});
