import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/api';
import CreatorFlow from './CreatorFlow';

vi.mock('../api/api');
vi.mock('./ResultsPage', () => ({
  default: () => <div>MockResults</div>,
}));

describe('CreatorFlow', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.createSession).mockResolvedValue({
      id: 1,
      name: 'Fredagsgänget',
      share_code: 'ABC123',
    });
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:5174', pathname: '/' },
      writable: true,
    });
  });

  it('renders group name input and create button', () => {
    render(<CreatorFlow />);
    expect(screen.getByPlaceholderText(/gruppnamn/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skapa grupp/i })).toBeInTheDocument();
  });

  it('does not call createSession when name is empty', async () => {
    render(<CreatorFlow />);
    await user.click(screen.getByRole('button', { name: /skapa grupp/i }));
    expect(api.createSession).not.toHaveBeenCalled();
  });

  it('calls createSession with entered name', async () => {
    render(<CreatorFlow />);
    await user.type(screen.getByPlaceholderText(/gruppnamn/i), 'Fredagsgänget');
    await user.click(screen.getByRole('button', { name: /skapa grupp/i }));
    expect(api.createSession).toHaveBeenCalledWith('Fredagsgänget');
  });

  it('shows share link after session creation', async () => {
    render(<CreatorFlow />);
    await user.type(screen.getByPlaceholderText(/gruppnamn/i), 'Fredagsgänget');
    await user.click(screen.getByRole('button', { name: /skapa grupp/i }));
    await waitFor(() =>
      expect(screen.getByText(/ABC123/i)).toBeInTheDocument()
    );
  });
});
