import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/api';
import ResultsPage from './ResultsPage';

vi.mock('../api/api');

const mockData = {
  session: { id: 1, name: 'Fredagsgänget' },
  participants: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ],
  results: [
    {
      app: { id: 1, name: 'Signal', description: 'Privacy first', website_url: 'https://signal.org' },
      count: 2,
      who: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
    },
    {
      app: { id: 2, name: 'Telegram', description: 'Feature rich', website_url: 'https://telegram.org' },
      count: 1,
      who: [{ id: 1, name: 'Alice' }],
    },
  ],
};

describe('ResultsPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.getResults).mockResolvedValue(mockData);
  });

  it('shows loading state initially', () => {
    render(<ResultsPage sessionId={1} />);
    expect(screen.getByText(/laddar/i)).toBeInTheDocument();
  });

  it('fetches results with correct sessionId', () => {
    render(<ResultsPage sessionId={42} />);
    expect(api.getResults).toHaveBeenCalledWith(42);
  });

  it('renders app names after loading', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => expect(screen.getByText('Signal')).toBeInTheDocument());
    expect(screen.getByText('Telegram')).toBeInTheDocument();
  });

  it('shows participant chips', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => screen.getByText('Signal'));
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);
  });

  it('shows participant count', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => screen.getByText(/2 personer/i));
  });

  it('refreshes on button click', async () => {
    render(<ResultsPage sessionId={1} />);
    await waitFor(() => screen.getByText('Signal'));
    await user.click(screen.getByRole('button', { name: /uppdatera/i }));
    expect(api.getResults).toHaveBeenCalledTimes(2);
  });

  it('shows error on fetch failure', async () => {
    vi.mocked(api.getResults).mockRejectedValue(new Error('Server error'));
    render(<ResultsPage sessionId={1} />);
    await waitFor(() =>
      expect(screen.getByText(/server error/i)).toBeInTheDocument()
    );
  });
});
